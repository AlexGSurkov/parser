'use strict';

const request = require('request-promise');

/**
 * Checks if user id is in session and that user exists
 *
 * @param {object}    req
 * @param {object}    res
 * @param {function}  next
 */
module.exports = (req, res, next) => {
  Promise.resolve(req.session.userId).then(userId => {
    if (!userId) {
      throw new Error('You are not authorized!');
    }

    const filter = {
      where: {id: userId}
    };

    return request.post({
      uri: `http://${sails.config.microservices.allInclusive}/allinclusive/user/filter`,
      body: {filter},
      json: true
    });
  }).then(({status} = {}) => {
    if (status !== 'ok') {
      throw new Error('Authorized user doesn`t exists!');
    }

    next();
  }).catch(e => {
    res.jsonBad(e.message);
  });
};
