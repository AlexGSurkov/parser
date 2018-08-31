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
  }

};
