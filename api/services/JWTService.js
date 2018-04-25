'use strict';

/**
 *
 * This service is used by APIGateway microservice
 *
 */

const jsonwebtoken = require('jsonwebtoken');

module.exports = {
  /**
   * Validate token to be correct JWT and it is not expired and returns data payload on success
   *
   * @param   {string}    jwt     JWT
   * @returns {object|null}       data payload
   */
  verifyToken(jwt) {
    try {
      return Object.assign({}, jsonwebtoken.verify(jwt, sails.config.jwt.secretKey), {jwt});
    } catch (e) {
      throw new Error(`JWT service: verifying error: ${e.message} (${e.name})`);
    }
  },

  /**
   * Creates JWT with data payload in it
   *
   * @param   {object}    payload     data to put inside token
   * @returns {string|null}           JWT
   */
  createToken(payload = {}) {
    const authToken = jsonwebtoken.sign(payload, sails.config.jwt.secretKey, {expiresIn: sails.config.jwt.expiresIn});

    if (this.verifyToken(authToken)) {
      return authToken;
    }
  },

  /**
   * Get auth user payload data (id, scope, phone) from JWT
   *
   * @param   {object} req
   * @returns {object}
   */
  getPayloadData(req) {
    const authToken = extractAuthToken(req);

    if (authToken) {
      return this.verifyToken(authToken);
    }

    throw new Error('JWT service: user is not authorized (JWT not found in headers or query param)');
  }
};


/**
 * Get auth token from headers (bearer type) or from query
 *
 * @param   {object}        req
 * @returns {string|null}
 */
function extractAuthToken(req) {
  if (req.headers.authorization) {
    const [scheme, credentials] = req.headers.authorization.split(' ');

    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
  }

  return req.param('auth_token') ? req.param('auth_token') : null;
}
