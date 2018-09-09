'use strict';

//const Promise = require('bluebird'),
//  _ = require('lodash');

module.exports = {

  /**
   * Clones any object deeply (useful for sequelize`s DAOs that cannot be parsed deeply by "toJSON()" or "get({raw: true})" methods)
   * Also this is much faster than lodash cloneDeep method
   *
   * @param  {*}    object    object to clone
   * @return {*}              deeply cloned object
   */
  cloneDeep(object) {
    return JSON.parse(JSON.stringify(object));
  },

  checkAuthorisation(req) {
    return JWTService.getPayloadData(req);
  },
  /**
   * Add time zone to ISO date
   *
   * @param   {string}   dt    ISO date
   * @returns {Date}
   */
  addTimeZone(dt) {
    dt = new Date(dt);
    dt = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000); // eslint-disable-line no-magic-numbers

    return dt;
  },

  logActionError(module, msg, action) {
    return Logging.create({module, msg, action});
  }

};
