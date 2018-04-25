'use strict';

const request = require('request-promise'),
  _ = require('lodash'),
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
  },

  /**
   * Get logged user scope
   *
   * @param   {object}   req
   * @param   {object}   res
   */
  getUserScope(req, res) {
    Promise.resolve(req.session && req.session.userId).then(id => {
      if (!id) {
        throw new Error('User is not authorized by session');
      }

      return Promise.all([getAllScopes(), getUserScope(id)]);
    }).then(([scopes = [], userScope = []]) => {
      res.jsonOk(_.intersection(_.map(scopes, 'code'), userScope));
    }).catch(e => {
      res.jsonBad(e.message);
    });
  },

  /**
   * Check if user authorized or not
   *
   * @param   {object}   req
   * @param   {object}   res
   */
  isAuthorized(req, res) {
    res.jsonOk(Boolean(req.session && req.session.userId));
  }

};

/**
 * Get all scopes
 *
 * @returns {Promise}
 */
function getAllScopes() {
  return request.post({
    uri: `http://${sails.config.microservices.allInclusive}/allinclusive/scopes/filter`,
    body: {filter: {attributes: ['code']}},
    json: true
  }).then(({status, data, errorMsg} = {}) => {
    if (status !== 'ok') {
      throw new Error(errorMsg);
    }

    return data;
  });
}

/**
 * Ger user scope
 *
 * @param   {string}   id   user id
 * @returns {Promise}
 */
function getUserScope(id) {
  return request.post({
    uri: `http://${sails.config.microservices.allInclusive}/allinclusive/user/filter`,
    body: {filter: {where: {id}, attributes: ['scope']}},
    json: true
  }).then(({status, data, errorMsg} = {}) => {
    if (status !== 'ok') {
      throw new Error(errorMsg);
    }

    return data.scope;
  });
}

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
