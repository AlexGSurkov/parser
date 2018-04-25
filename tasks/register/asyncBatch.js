'use strict';

const {Sails} = require('sails'),
  Promise = require('bluebird'),
  request = require('request-promise'),
  {sailsPortsToLift} = require(process.cwd() + '/config/sailsPortsToLift.js');

// todo: export batch statuses to constants

/**
 * Lifts sails from grunt
 *
 * @param   {object}    grunt
 * @returns {Promise}
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
      port: sailsPortsToLift.asyncBatch,
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


function doRequest(requestId) {
  let currentBatchRequest = null;

  return ApiAsyncBatchLog.find({
    where: {
      id: requestId
    }
  }).then(response => {
    if (response && Array.isArray(response.requestsData)) {
      currentBatchRequest = response;

      return response.update({status: 'in progress'});
    }
    throw new Error(`${response ? 'Empty' : 'Not found'} batch-request object with id "${requestId}"`);
  }).then(response => {
    console.info(`Starting request with id "${requestId}"`);

    return Promise.map(response.requestsData, reqData => {
      return request(IntegrationAPI.buildRequestOptions({
        method: reqData.method,
        relativeUrl: reqData.relative_url,
        body: reqData.body,
        req: currentBatchRequest.params,
        fullResponse: true
      }));
    }, {concurrency: sails.config.integrationapi.batchRequestConcurency});

  }).then(apiResponses => {
    let hasError = false;

    apiResponses = apiResponses.map(response => {
      if (!/^2/.test(String(response.statusCode))) {
        hasError = true;
        return {
          success: false,
          errors: [`${response.statusCode} ${response.statusMessage}`]
        };
      } else if (!response.body.success) {
        hasError = true;
      }

      return response.body;
    });
    console.info(`Done request with id "${requestId}"`);

    return currentBatchRequest.update({status: 'done', hasError, responsesData: apiResponses});
  }).catch(e => {
    if (currentBatchRequest) {
      return currentBatchRequest.update({status: 'error', hasError: true, errorMsg: e.message}).then(() => {
        throw e;
      });
    }
    throw e;
  });
}


module.exports = function(grunt) {
  grunt.registerTask('asyncBatch', function(requestId) {

    let done = this.async(),
      doingAll = grunt.option('all'),
      sailsInstance;

    liftSails(grunt).then(sails => {
      sailsInstance = sails;
      if (doingAll) {
        console.info('Runing all batches');

        return ApiAsyncBatchLog.findAll({
          where: {
            status: 'pending'
          },
          order: [['createdAt', 'ASC']]
        }).then(responses => {
          console.info(`Found ${responses.length} batches to run`);

          return Promise.mapSeries(responses, batchLogObject => {
            const hrstart = process.hrtime();

            return doRequest(batchLogObject.id).then(() => {
              const hrend = process.hrtime(hrstart);

              // eslint-disable-next-line no-magic-numbers
              console.info(`Request time: ${batchLogObject.id} (hr): ${hrend[0]}.${Math.round(hrend[1]/1000000)} s`);
            });
          });
        });
      } else if (requestId) {
        console.info(`Runing one batch with id "${requestId}"`);

        return doRequest(requestId);
      }

      throw new Error('Requests are not specified');
    }).then(() => {
      sailsInstance.lower(done);
    }).catch(e => {
      sailsInstance.lower(() => done(e));
    });
  });
};
