'use strict';

/**
 * Checks auth header or query string for token to be correct and existence
 *
 * @param {object}    req
 * @param {object}    res
 * @param {function}  next
 */
module.exports = function(req, res, next) {
  Promise.resolve().then(() => {
    if (req.headers && req.headers.authorization) {
      const [schema, token] = req.headers.authorization.split(' ');

      if (/^Bearer$/i.test(schema) && token) {
        return token;
      }
      throw new Error("Auth header is not correct Bearer-type token!");

    } else if (req.param('auth_token')) {
      return req.param('auth_token');
    }
    throw new Error("Auth token must be specified!");

  }).then(token => {
    return CustomerAuthToken.findOne({
      where: {token},
      include: {
        model: GardenizeCustomer,
        as: 'owner',
        where: {
          name: sails.config.resources.customer
        }
      }
    });
  }).then(token => {
    if (!token) {
      throw new Error("Auth token not found!");
    }
  }).then(() => next()).catch(e => {
    res.jsonGAA(null, e.message);
  });
};
