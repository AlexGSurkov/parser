'use strict';

const request = require('request-promise');

/**
 * Checks auth header or query string for token to be correct and existence
 *
 * @param {object}    req
 * @param {object}    res
 * @param {function}  next
 */
module.exports = function(req, res, next) {
  /**
   * transfer both variants for auth: header and by query string
   */
  const authHeader = req.headers && req.headers.authorization ? req.headers.authorization : null;

  request.post({
    uri: 'http://' + sails.config.microservices.allInclusive + '/allinclusive/gaa/verify/token',
    json: true,
    qs: {
      auth_token: req.param('auth_token')
    },
    headers: {
      authorization: authHeader
    }
  }).then(({success, errorMessage}) => {
    if (!success) {
      throw new Error(errorMessage);
    }

    next();
  }).catch(e => {
    res.jsonGAA(null, e.message);
  });
};
