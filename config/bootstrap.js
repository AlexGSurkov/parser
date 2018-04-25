const pg = require('pg');

/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  /**
   * Set data type parsers for sequelize
   */

  // for decimal
  pg.types.setTypeParser(1700, val => Number.parseFloat(val));


  /**
   * Bootstrap sails
   */

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  sails.log.info(`Node version: ${process.version}`);
  cb();
};
