'use strict';

let {Sails} = require('sails'),
  Promise = require('bluebird'),
  Request = require('request-promise'),
  fs = require('fs'),
  _ = require('lodash'),
  {sailsPortsToLift} = require(process.cwd() + '/config/sailsPortsToLift.js');

const FETCH_LIMIT = 100,
  RESOURCE_CONCURRENCY = 10,
  SYNC_CONCURRENCY = 50,
  MODULE_CONCURRENCY = 1,
  PRIORITY_LIMIT = 100;


/**
 * Lifts sails from grunt
 *
 * @param   {object}     grunt
 * @returns {bluebird}
 */
function liftSails(grunt) {
  return new Promise((resolve, reject) => {
    let sails,
      sailsConfig,
      env;

    if (grunt.option('env')) {
      env = grunt.option('env');
    } else {
      env = process.env.NODE_ENV;
    }

    sailsConfig = {
      port: sailsPortsToLift.syncResources,
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
    sails.lift(sailsConfig, err => {
      if (err) {
        grunt.log.error(err.stack);
        return reject(err);
      }
      return resolve(sails);
    });
  });
}


function getResource(resource) {
  let config = sails.config.microservices;

  return Request.get({
    uri: 'http://' + config.integrationAPI + '/api/resources/objects/' + resource + '/count?auth_token=' + config.integrationAPIAuthToken,
    json: true
  }).then(function(result) {
    let promiseArr = [],
      offset = 0;

    if (result.success) {
      if (result[resource] > 0) {
        while (result[resource] > 0) {
          promiseArr.push('http://' + config.integrationAPI + '/api/resources/objects/' + resource + '?auth_token=' + config.integrationAPIAuthToken +
            '&offset=' + offset + '&limit=' + FETCH_LIMIT);
          offset += FETCH_LIMIT;
          result[resource] -= FETCH_LIMIT;
        }
        return Promise.map(promiseArr, url => {
          return Request.get({
            uri: url,
            json: true
          });
        }, {concurrency: RESOURCE_CONCURRENCY}).then(function(result) {
          if (result) {
            let forUpdate = [];

            result.forEach(function(item) {
              forUpdate = forUpdate.concat(item[resource]);
            });
            return forUpdate;
          }

          throw new Error('get all ' + resource + 's error...');
        });
      }

      return [];
    }

    throw new Error(result.errors);
  });
}

function moduleCall(grunt, priority, syncModules) {
  let groupModules = syncModules.filter(syncModule => syncModule.priority === priority);

  if (groupModules.length) {
    return Promise.map(groupModules, syncModule => {
      return getResource(syncModule.resource).then(resource => {
        let counter = 0;

        if (resource.length) {
          return Promise.map(resource, data => {
            grunt.log.writeln("Sync module: ", syncModule, " id: ", data.id, " counter: ", counter++, " Resource len: ", resource.length);
            return syncModule.sync(data.id, sails.config.microservices.integrationAPIAuthToken);
          }, {concurrency: SYNC_CONCURRENCY}).then(() => {
            return resource.length;
          }).catch(error => {
            throw new Error(syncModule.resource + ' synchronization error: ' + error);
          });
        }
      }).then(count => {
        grunt.log.writeln(count + ' from ' + syncModule.resource + ' synchronized');
      });
    }, {concurrency: MODULE_CONCURRENCY}).then(() => {
      syncModules = _.difference(syncModules, groupModules);
      priority++;
      if (syncModules.length && priority < PRIORITY_LIMIT) { //priority limits 100
        return moduleCall(grunt, priority, syncModules);
      } else if (syncModules.length && priority === PRIORITY_LIMIT) {
        return moduleCall(grunt, undefined, syncModules);
      }

      return new Promise.resolve();
    });
  }

  priority++;
  if (syncModules.length && priority < PRIORITY_LIMIT) { //priority limits 100
    return moduleCall(grunt, priority, syncModules);
  } else if (syncModules.length && priority === PRIORITY_LIMIT) {
    return moduleCall(grunt, undefined, syncModules);
  }

  return new Promise.resolve();
}

module.exports = function(grunt) {
  grunt.registerTask('syncResources', 'Synchronize resources in database', function(syncModules) {
    let done = this.async(),
      sync = [],
      sailsInstance;

    syncModules = syncModules ? syncModules.split(',') : [];
    syncModules = syncModules.map(item => item.toLowerCase());

    liftSails(grunt).then(sails => {
      sailsInstance = sails;
      grunt.log.writeln("Sails up");

      const adapterDir = grunt.option('adapterDir') || sails.config.integrationapi.defaultAdapter;

      return fs.readdirSync(sails.config.appPath + '/api/services/Adapters/' + adapterDir + '/').forEach(file => {
        if (!file.match(/isync.js/gi)) {
          if (syncModules.length && !syncModules.includes(file.replace(/.js/g, '').toLowerCase())) {
            return false;
          }
          let syncModule = require(sails.config.appPath + '/api/services/Adapters/' + adapterDir + '/' + file);

          syncModule = new syncModule();
          syncModule.name = file.replace(/.js/g, '').toLowerCase();
          sync.push(syncModule);
        }
      });
    }).then(() => {
      //check if asked modules found
      if (syncModules.length) {
        let modules = sync.map(item => item.name);
        let diff = _.difference(syncModules, modules);

        diff.map(item => {
          grunt.log.error('module "' + item + '" which you ask, isn\'t found');
        });
      }

      if (sync.length) {
        return moduleCall(grunt, 1, sync).then(() => {
          grunt.log.writeln('resources synchronization is complete');
        });
      }
      grunt.log.writeln('Here isn\'t resource for synchronization');

    }).then(() => {
      sailsInstance.lower(done);

    }).catch(e => {
      console.info(e.stack);
      grunt.log.error(e);
      sailsInstance.lower(() => done(e));
    });
  });
};
