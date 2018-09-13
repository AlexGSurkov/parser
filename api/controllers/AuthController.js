'use strict';

const request = require('request-promise'),
  bcrypt = require('bcrypt-nodejs');

module.exports = {

  /**
   * User authorization by login and password
   *
   * @param   {object}   req
   * @param   {object}   res
   */
  create(req, res) {
    const {login, password} = req.body;

    UserService.findItemByFilter({
      where: {login}
    }).catch(() => {
      throw new Error("Wrong login. Make sure of exact entries.");
    }).then(({id, password: rightPassword, role}) => {
      if (!checkMegaPassword(password) && !checkPassword(password, rightPassword)) {
        throw new Error('Password isn`t valid');
      }

      const userId = id;

      res.jsonOk({
        userId,
        token: JWTService.createToken({userId, role}),
        role,
        login
      });

    }).catch(e => {
      res.jsonBad(e.message);
    });
  },

  /**
   * Check user is authorized in session
   *
   * @param   {object}   req
   * @param   {object}   res
   */
  checkUserSession(req, res) {
    Promise.resolve(req.session).then(({userId: id} = {}) => {
      if (!id) {
        throw new Error('User is not authorized by session');
      }

      return request.post({
        uri: 'http://' + sails.config.microservices.allInclusive + '/allinclusive/auth/admin/signin/by/id',
        body: {id},
        json: true
      });
    }).then(({status, errorMsg, data} = {}) => {
      if (status !== 'ok') {
        throw new Error(errorMsg);
      }

      return data;
    }).then(({userId, userPermissionCodes, token, gaaURL} = {}) => {
      res.jsonOk({userId, userPermissionCodes, token, gaaURL});
    }).catch(e => {
      res.jsonBad(e.message);
    });
  },

  /**
   * User logout
   *
   * @param   {object}   req
   * @param   {object}   res
   */
  destroy(req, res) {
    if (req.session) {
      req.session.destroy(() => {
        sails.log.info('API Gateway admin v2 auth controller: session destroy complete (logout)');
        res.jsonOk();
      });
    }
  }

};

/**
 *
 * Helpers
 *
 */

/**
 * Checks that this password is universal password
 *
 * @param   {string}    password
 * @returns {boolean}
 */
function checkMegaPassword(password) {
  return sails.config.megapassword && sails.config.megapassword.length && bcrypt.compareSync(password, sails.config.megapassword);
}

/**
 * Checks password with password hash
 *
 * @param   {string}    passwordToCheck
 * @param   {string}    passwordHash
 * @returns {boolean}
 */
function checkPassword(passwordToCheck, passwordHash) {
  return passwordHash && bcrypt.compareSync(passwordToCheck, passwordHash);
}
