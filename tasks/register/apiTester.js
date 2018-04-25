'use strict';

const Promise = require('bluebird'),
  {Sails} = require('sails'),
  fs = require('fs'),
  path = require('path'),
  readFile = Promise.promisify(fs.readFile),
  statFile = Promise.promisify(fs.stat),
  request = require('request-promise'),
  {sailsPortsToLift} = require(process.cwd() + '/config/sailsPortsToLift.js');


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
      port: sailsPortsToLift.apiTester,
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


module.exports = grunt => {

  grunt.registerTask('apitester', function(authToken) {
    let done = this.async(),
      requestFullPath = '',
      requestFile = grunt.option('requestFile'),
      requestPath = grunt.option('requestPath'),
      err,
      sailsInstance,
      requestData,
      reqStartTime,
      reqFinTime;

    if (!authToken) {
      err = 'authToken is required';
      grunt.log.writeln(err);
      return done(err);
    }

    if (!requestFile && !requestPath) {
      err = 'One of requestFile or requestPath is required';
      grunt.log.writeln(err);
      return done(err);
    }

    if (requestPath) {
      requestFullPath = requestPath;
    } else {
      requestFullPath = path.join(__dirname, '/../apiRequests/' + requestFile);
    }

    statFile(requestFullPath).then(() => {
      return readFile(requestFullPath);
    }).then(fileContent => {
      requestData = JSON.parse(fileContent);
      console.info(requestData);

      return liftSails(grunt);
    }).then(sails => {
      sailsInstance = sails;
      reqStartTime = new Date().getTime();

      return request({
        method: 'POST',
        url: ServiceRegistry.makeUrl(
          'integrationAPI',
          `${sails.config.integrationapi.defaultAdapter}/api/batch?auth_token=${authToken}`
        ),
        simple: false,
        resolveWithFullResponse: false,
        json: true,
        body: requestData
      });

    }).then(response => {
      reqFinTime = new Date().getTime();

      console.info('Response: ', response);
      console.info('Execution time: ', reqFinTime - reqStartTime);
    }).then(() => {
      sailsInstance.lower(done);
    }).catch(e => {
      sailsInstance.lower(() => done(e));
    });

  });
};
