'use strict';

const path = require('path'),
  _ = require('lodash'),
  request = require('request-promise');

/**
 *
 * Universal policy with filename as permission code to check
 *
 */

/**
 * Checks if user id is in session and have access to permission with code same as snake-cased filename
 *
 * @param  {object}    req
 * @param  {object}    res
 * @param  {function}  next
 */
module.exports = (req, res, next) => {
  Promise.resolve(JWTService.getPayloadData(req)).then(({userId} = {}) => {
    if (!userId) {
      throw new Error('You are not authorized!');
    }

    return request.post({
      uri: `http://${sails.config.microservices.allInclusive}/allinclusive/rbac/access/${userId}`,
      json: true,
      body: {
        permissions: getPermissionCode()
      }
    });
  }).then(response => {
    if (response.status !== 'ok' || !response.data) {
      sails.log.debug(response.errorMsg);
      res.jsonOk();
    } else {
      next();
    }
  }).catch(e => {
    res.jsonBad(e.message);
  });
};

/**
 * Get permission code to check
 *
 * @returns {string}
 */
const getPermissionCode = () => _.snakeCase(path.basename(__filename, '.js'));
