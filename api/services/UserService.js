'use strict';

const //Promise = require('bluebird'),
  //_ = require('lodash'),
  bcrypt = require('bcrypt-nodejs');

const BCRYPT_HASH_ROUNDS = 8,
  PASSWORD_LENGTH_MIN = 5,
  PASSWORD_LENGTH_MAX = 20;

module.exports = {

  /**
   *
   * One user
   *
   */

  /**
   * Find one item by filter
   *
   * @param   {object}    filter
   * @returns {Promise}
   */
  findItemByFilter(filter = {}) {
    return User.findOne(filter).then(item => {
      if (!item) {
        throw new Error('User not found by filter');
      }
      return item;
    });
  },

  /**
   *
   * Helpers
   *
   */

  getUserPasswordHash(password) {
    const passwordError = checkForPasswordErrors(password);

    if (passwordError) {
      throw new Error(passwordError);
    }

    return bcrypt.hashSync(password, bcrypt.genSaltSync(BCRYPT_HASH_ROUNDS));
  }

};

function checkForPasswordErrors(password) {
  if (!password) {
   return "Password must be specified";
  } else if (password.length < PASSWORD_LENGTH_MIN || password.length > PASSWORD_LENGTH_MAX) {
   return `Password must be in range from ${PASSWORD_LENGTH_MIN} to ${PASSWORD_LENGTH_MAX} characters`;
  }

  return null;
}
