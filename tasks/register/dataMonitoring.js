'use strict';

const fs = require('fs'),
  {Sails} = require('sails'),
  Promise = require('bluebird'),
  path = require('path'),
  _ = require('lodash'),
  QueryStream = require('pg-query-stream'),
  rulesDir = path.normalize(process.cwd() + '/tasks/dataMonitoring/rules/'),
  logsDir = path.normalize(process.cwd() + '/tasks/dataMonitoring/'),
  {sailsPortsToLift} = require(process.cwd() + '/config/sailsPortsToLift.js'),
  streamBatchSize = 10000;

let instanceOfSails = null,
  sailsModels = null,
  advancedLogs = false,
  maxItemsByQuery = 500;


/*
 *
 * Main task methods
 *
 */

function liftSails(grunt) {
  return new Promise(function(resolve, reject) {
    let sails,
      sailsConfig,
      env;

    if (grunt.option('env')) {
      env = grunt.option('env');
    } else {
      env = process.env.NODE_ENV;
    }

    sailsConfig = {
      port: sailsPortsToLift.dataMonitoring,
      log: {level: process.env.LOG_LEVEL || 'error'},
      environment: env,
      migrating: false,
      hooks: {
        blueprints: false,
        orm: false,
        pubsub: false,
        grunt: false
      }
    };

    sails = new Sails();
    sails.lift(sailsConfig, function(err) {
      if (err) {
        grunt.log.error(err.stack);
        return reject(err);
      }
      return resolve(sails);
    });
  });
}

function loadRules(ruleName) {
  let pattern = new RegExp(`^(${ruleName || '\\w+'})(?=\\.js$)`, `i`),
    rules = {};

  return Promise.mapSeries(fs.readdirSync(rulesDir), fileName => {
    return Promise.resolve().then(() => {
      let keyName = fileName.match(pattern);

      if (keyName && Array.isArray(keyName)) {
        rules[keyName[0]] = require(rulesDir + fileName);
      }
    }).catch(err => {
      throw new Error(`Failed to load "${fileName}". Reason: ${err.message}`);
    });
  }).then(() => {
    if (!Object.keys(rules).length) {
      throw new Error(`Not found ${ruleName ? `rule with name "${ruleName}"` : "any rules"}`);
    }
    return rules;
  });
}

function runRules(rules) {
  return Promise.map(Object.keys(rules), ruleName => {
    return setLogsArchivedStatus(ruleName).then(() => {
      console.info(`\nRunning "\x1b[32m%s\x1b[0m"...`, ruleName);
      return rules[ruleName].run(DataExtractors, Logger.bind(null, ruleName));
    }).then(result => {
      console.info(`\nDone "\x1b[32m%s\x1b[0m".`, ruleName);
      return checkRuleStatus({source: `${ruleName}.js`, logs: result});
    }).catch(err => {
      console.info(`\nError "\x1b[31m%s\x1b[0m".`, ruleName);
      return checkRuleStatus({source: `${ruleName}.js`}, err);
    });
  }, {concurrency: 1});
}

function getModels(sails) {
  let models = {};

  Object.keys(sails.models).forEach(modelKey => {
    models[sails.models[modelKey].name] = sails.models[modelKey];
  });
  return models;
}

function checkRuleStatus(params, error) {
  return Object.assign({
      source: params.source,
      done: !error
    },
    error ? {errorMsg: parseErrorMessage(error)} : {},
    params.logs || {}
  );
}

function setLogsArchivedStatus(ruleName) {
  if (!ruleName) {
    throw new Error('Can\'t update logs without rule name. Use setLogsArchivedStatus(ruleName).');
  }
  showMessage(`Setting archive status to old logs in database where rule name is "${ruleName}"`);
  return InvalidatedResourcesLog.update({archive: true}, {where: {archive: false, ruleName}});
}

function saveTaskPerformanceLogs(data) {
  //eslint-disable-next-line no-magic-numbers
  fs.writeFileSync(logsDir + 'logs.json', JSON.stringify(data, null, 2));
}

function parseErrorMessage(error) {
  return `${error.name}: ${error.message}`;
}

function showMessage(message) {
  if (advancedLogs) {
    console.info(message);
  }
}

/*
 *
 * Rules task methods
 *
 */


function _getAllModelIdsByQuery(modelName, {where = {}, scope} = {}) {
  return sailsModels[modelName].scope(scope).findAll({
    attributes: ['id'],
    raw: true,
    where
  }).then(records => _.map(records, 'id'));
}


/**
 * It replace all "model" field string value in includeData to link on Sails Model
 * and set right scope to each include level (if model don't has own scope - set default scope)
 *
 * @param     {array} includeData
 * @returns   {array}
 */
function _getIncludeQuery(includeData) {
  return includeData.map(params => {
    params.model = sailsModels[params.model].scope(_.get(params, 'scope', 'defaultScope'));
    if (params.include) {
      params.include = _getIncludeQuery(params.include);
    }
    return params;
  });
}


/**
 * Get model data by name & params.
 * It receivnig all model ids as array and slice it on fragments by maxItemsByQuery variable
 * Then (in loop) recieving complete records by pieces and put it into callback function
 * If callback function don't exist - it return array of Promises with records (long array of model data can eat all memory. Use callback better)
 *
 * @param   {string}      modelName
 * @param   {object}      obj
 * @param   {object}      obj.where
 * @param   {array}       obj.include
 * @param   {array|null}  obj.attributes
 * @param   {string}      obj.scope         it's model scope. don't confuse with scope by manufacturer
 * @param   {function}    callback
 * @returns {Promise[]}
 */
function getModelData(modelName, {where = {}, include = [], attributes = null, scope = 'defaultScope'} = {}, callback) {
  if (Object.keys(sailsModels).indexOf(modelName) < 0) {
    throw new Error(`Not found model with name "${modelName}"`);
  }

  include = _getIncludeQuery(include);

  return _getAllModelIdsByQuery(modelName, {where, scope}).then(AllModelIds => {
    let totalCount = AllModelIds.length,
      pluralModelName = modelName.toLowerCase() + 's',
      countOfReceivingItems = 0;

    return Promise.mapSeries(_.chunk(AllModelIds, maxItemsByQuery), ids => {
      return sailsModels[modelName].scope(scope).findAll({
        where: {
          id: ids
        },
        attributes,
        include
      }).then(items => {
        countOfReceivingItems += items.length;
        showMessage(`Received ${items.length} ${pluralModelName} (${countOfReceivingItems}/${totalCount}).`);
        return callback && typeof callback === 'function' ? callback(items) : items;
      });
    }).then(res => _.flatten(res));
  });
}

function getModelDataStream(modelName, {where = {},attributes = null} = {}) {

  return Promise.resolve().then(() => {
    return SequelizeConnections[sails.config.models.connection].connectionManager.getConnection();
  }).then(connection => {
    let model = sailsModels[modelName],
      queryOpt = {
        attributes: attributes || Object.keys(model.tableAttributes),
        where
      };

    let selectQuery = model.QueryInterface.QueryGenerator.
                      selectQuery(model.getTableName(),queryOpt,model);

    let dataStream = connection.query(new QueryStream(selectQuery,null,{batchSize: streamBatchSize}));

    return {dataStream, connection};
  });

}

let DataExtractors = {
  getModelData,
  getModelDataStream
};

let Logger = (function() {

  function Logger(ruleName, resourceType) {
    if (!ruleName || !resourceType) {
      throw new Error('Can\'t create logger without params. Use "new Logger("ruleName", "resourceName")".');
    }

    this.data = [];
    this.typeOfResource = resourceType;
    this.ruleName = ruleName;
  }

  Logger.prototype.addLog = function(resourceId, message) {
    if (!resourceId || !message) {
      throw new Error('Can\'t create log!. "addLog" required two arguments "resourceId" and "message")');
    }
    this.data.push({
      resourceId: this._removeAdapterNameFromId(resourceId),
      resourceType: this.typeOfResource,
      message,
      adapter: this._getAdapterNameFromId(resourceId),
      ruleName: this.ruleName
    });
  };

  Logger.prototype._removeAdapterNameFromId = function(resourceId) {
    return resourceId.replace(/^[^\_]+_/, '');
  };

  Logger.prototype._getAdapterNameFromId = function(resourceId) {
    let adapter = resourceId.match(/^[^\_]+(?=_)/);

    return adapter ? adapter[0] : 'N/A';
  };

  Logger.prototype.saveData = function() {
    let countOfSavedData = 0;

    console.info(`\nStart save logs from rule "\x1b[32m%s\x1b[0m", resource "\x1b[32m%s\x1b[0m"`, this.ruleName, this.typeOfResource);
    return Promise.mapSeries(_.chunk(this.data, maxItemsByQuery), logs => {
      countOfSavedData += logs.length;
      return InvalidatedResourcesLog.bulkCreate(logs).then(() => showMessage(`Save ${logs.length} invalidated resources logs to database "InvalidatedResourcesLog" (${countOfSavedData}/${this.data.length}).`));
    }).then(() => ({countOfInvalidResources: this.data.length}));
  };

  return Logger;

})();


module.exports = function(grunt) {
  grunt.registerTask('dataMonitoring', function(ruleName) {
    let done = this.async();

    if (grunt.option('rules')) {
      return loadRules().then(rules => {
        let availableRules = Object.keys(rules).map(ruleName => '\n  ' + ruleName).join('');

        console.info(`\n \x1b[32m%s\x1b[0m`, `Available rules:`);
        console.info(availableRules);
        done();
      });
    }

    advancedLogs = grunt.option('advancedLogs');
    maxItemsByQuery = parseInt(grunt.option('maxItemsByQuery') || maxItemsByQuery);

    liftSails(grunt).then(server => {
      instanceOfSails = server;
      sailsModels = getModels(instanceOfSails);
      return loadRules(ruleName || null);
    }).then(runRules).then(response => {
      saveTaskPerformanceLogs(response);
      console.info(`\nCheck logs in "\x1b[32m%s\x1b[0m".`, `${logsDir}logs.json`);
      instanceOfSails.lower(done);
    }).catch(err => {
      saveTaskPerformanceLogs({source: 'dataMonitoring.js', done: false, errorMsg: parseErrorMessage(err)});
      console.info(`\nCheck logs in "\x1b[32m%s\x1b[0m".`, `${logsDir}logs.json`);
      instanceOfSails.lower(() => done(err));
    });

  });
};
