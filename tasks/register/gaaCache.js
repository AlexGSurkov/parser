'use strict';

const {Sails} = require('sails'),
  Promise = require('bluebird'),
  _ = require('lodash'),
  request = require('request-promise'),
  Sequelize = require('sequelize'),
  {sailsPortsToLift} = require(process.cwd() + '/config/sailsPortsToLift.js');

const CONCURRENCY = 1,
  ONE_HUNDRED = 100;

class GAACacheSync {
  constructor({packageInfo, app, itemType, analyticLastUpdate}) {
    this.packageInfo = packageInfo;
    this.app = app;
    this.itemType = itemType;
    this.methodName = `getBy${_.capitalize(itemType)}`,
    this.analyticLastUpdate = analyticLastUpdate;
  }

  /**
   * Run GAA getBy[Item] method for all items.
   *
   * @returns {Promise}
   */
  runGAAMethod() {
    let capitalizedItemType = _.capitalize(this.itemType),
      itemIdsToCache = [],
      cacheKeys = GAA.AppItemCache.makeCacheKeys(this.app, this.app[`app${capitalizedItemType}s`]);

    return Promise.map(this.app[`app${capitalizedItemType}s`], item => {
      return this._isNeedToCache(cacheKeys.get(item.itemId), this.methodName).then(needCache => {
        needCache && itemIdsToCache.push(item.itemId);
      });
    }, {concurrency: ONE_HUNDRED}).then(() => {
      if (!itemIdsToCache.length) {
        return;
      }

      sails.log.info(`GAACacheSync: Need to create cache for method '${this.methodName}' application ${this.app.id}`);

      return GAA.gatherAppMetrics({
        app: this.app,
        itemType: this.itemType,
        ids: itemIdsToCache,
        packageInfo: this.packageInfo
      });
    }).then(metric => {
      metric && sails.log.info(`GAACacheSync: App: "${this.app.id}", Method: "${this.methodName}", Items: ${_.map(metric, 'id')}`);
    }).catch(e => {
      sails.log.error(`GAACacheSync: Warning ${this.app.id}!!! ${e.stack}`);
    });
  }

  /**
   * Check if app is need to be cached
   *
   * @param   {object}    cacheKey
   * @param   {string}    methodName
   * @returns {Promise}
   * @private
   */
  _isNeedToCache(cacheKey, methodName) {
    return GAA.AppItemCache.getCacheDate(cacheKey).then(cacheDate => {
      if (!cacheDate) {
        return true;
      }
      // app already cached
      if (this.packageInfo.isMethodCacheableAndResetByAnalytics(methodName)) {
        if (this.analyticLastUpdate && this.analyticLastUpdate > cacheDate) {
          // reset cache
          return GAA.AppItemCache.delete(cacheKey).then(() => {
            return true;
          });
        }
      }
      // by default no need reset cache
      return false;
    });
  }
}

module.exports = grunt => {
  grunt.registerTask('gaaCache', function(command) {
    if (!command || command !=='sync') {
      _usage(grunt);

      return done();
    }

    let done = this.async(),
      startTime = Date.now(),
      appIds = null,
      sailsInstance,
      appFilters = {
        where: {},
        order: [Sequelize.fn('RANDOM')]
      };

    if (grunt.option('apps')) {
      appIds = grunt.option('apps').split(',').map(aId => aId.trim());
    }

    if (appIds) {
      appFilters.where.id = appIds;
    }

    if (grunt.option('month') || grunt.option('currentMonth')) {
      const currentDate = new Date(),
        month = grunt.option('currentMonth') ? currentDate.getMonth() + 1 : grunt.option('month');

      Object.assign(appFilters.where, {
        finishDate: {$lte: new Date(currentDate.getFullYear(), month, 1)},
        startDate: {$gte: new Date(currentDate.getFullYear(), month - 1, 1)}
      });
    }

    _liftSails(grunt).then(sails => {
      sailsInstance = sails;

      return AppRegistry.count(appFilters);
    }).then(appCount => {
      sails.log.info(`Count ${appCount} of applications`);

      if (grunt.option('percent')) {
        appFilters.limit = Math.round(appCount * grunt.option('percent') / ONE_HUNDRED);
      }

      appFilters.attributes = sails.config.GAA.allowedAppFieldsForClient,
      appFilters.include = Object.keys(sails.config.GAA.itemTypes).map(itemType => {
        const capitalizedItemType = _.capitalize(itemType);

        return {
          model: `AppRegistry${capitalizedItemType}`,
          as: `app${capitalizedItemType}s`,
          attributes: [[`${itemType}Id`, 'itemId'], 'incentiveId', 'plan', 'parentId']
        };
      });

      return Promise.all([
        AppRegistryService.findItemsByFilter(appFilters),
        _getAnalyticLastUpdate()
      ]);
    }).then(([apps, analyticLastUpdate = null]) => {
      return Promise.each(Object.keys(sails.config.GAA.itemTypes), itemType => {
        return _runAndCacheGetByMethod(apps, itemType, analyticLastUpdate);
      });
    }).then(() => {
      const totalTime = Date.now() - startTime,
        logLevel = totalTime > sails.config.log.warnTimings.appsCache ? 'warn' : 'debug';

      sails.log[logLevel](`gaaCache:sync total time: ${totalTime}ms`);
      sailsInstance.lower(done);
    }).catch(e => {
      sails.log.error(e.message);
      sailsInstance.lower(() => done(e));
    });
  });
};


/**
 *
 * Helper methods
 *
 */

/**
 * Usage description
 *
 * @param   {grunt}   grunt
 * @private
 */
function _usage(grunt) {
  grunt.log.writeln('\nUsage: grunt gaaCache:sync [options]\n');
  grunt.log.writeln('gaaCache:sync options:');
  grunt.log.writeln('  --currentMonth  Cache of tne current month');
  grunt.log.writeln('  --month=MONTH  Month of the cache');
  grunt.log.writeln('  --apps=appId1,appId2  Application ids');
  grunt.log.writeln('  --percent=PERCENT Percent of applications for make caches');
}

/**
 * Lifts sails from grunt
 *
 * @param   {object}    grunt
 * @returns {Promise}
 * @private
 */
function _liftSails(grunt) {
  return new Promise((resolve, reject) => {
    let sails,
      sailsConfig,
      env = grunt.option('env') || process.env.NODE_ENV;

    sailsConfig = {
      port: sailsPortsToLift.gaaCacheSync,
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

/**
 * Get analytics last update time
 *
 * @returns {Promise}
 * @private
 */
function _getAnalyticLastUpdate() {
  return request.get({
    uri: sails.config.GAA.analyticsLastUpdateUrl,
    json: true
  }).then(({success, errorMsg, timestamp} = {}) => {
    if (!success) {
      throw new Error(errorMsg);
    }

    return timestamp;
  }).catch(e => {
    sails.log.error(`Warning!!! ${e.stack}`);
  });
}

/**
 * Run and cache getBy[User|Store] methods for each app
 *
 * @param   {sequelize[]}   apps                 array of sequelize instances
 * @param   {string}        itemType
 * @param   {number}        analyticLastUpdate
 * @returns {Promise}
 * @private
 */
function _runAndCacheGetByMethod(apps, itemType, analyticLastUpdate) {
  // run and cache lifecycle method getBy for itemType
  return Promise.map(apps, app => {
    sails.log.info('App: ', app.id, app.type, app.code, app.scope);
    return GAA.getPackageInfo(app.type, app.code).then(packageInfo => {
      // Check if method cacheable
      return packageInfo.isMethodCacheable(`getBy${_.capitalize(itemType)}`) &&
      new GAACacheSync({packageInfo, app, itemType, analyticLastUpdate}).runGAAMethod();
    });
  }, {concurrency: CONCURRENCY});
}
