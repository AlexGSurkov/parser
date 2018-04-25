'use strict';

const logger = require('../libs/logger');

/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#!/documentation/concepts/Logging
 */

module.exports.log = {

  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/

  // If provided, instead of logging directly to the console, the functions exposed
  // by the custom logger will be called, and log messages from Sails will be passed
  // through.
  custom: logger,

  // Set to false to disable captain's log's handling of logging, logs will instead
  // be passed to the configured custom logger
  inspect: false,

  // Set the level of detail to be shown in your app's log
  level: 'verbose',

  // crucial app timings (used for alerts)
  warnTimings: {
    handCollect: 50000,          // 50 seconds
    appMetricsGathering: 50000,  // 50 seconds
    appsCache: 300000,           // 5 minutes
    singleIAPI: 5000,            // 5 seconds
    batchIAPI: 50000             // 50 seconds
  }

};
