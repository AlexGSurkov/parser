'use strict';

const request = require('request-promise');

/**
 *
 * todo: DEPRECATED
 *
 */

module.exports = function(req, res, next) {
  Promise.resolve().then(() => {
    const authUserData = JWTService.getPayloadData(req);

    const filter = {
      where: {id: authUserData.userId}
    };

    return request.post({
      uri: 'http://' + sails.config.microservices.allInclusive + '/allinclusive/user/filter',
      body: {filter},
      json: true
    }).then(response => {
      if (!response.data || response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }
      // todo: remove direct call to RBAC service
      return RBACService.access(response.data.id, 'hand_access').then(() => {
        next();
      });
    });
  }).catch(e => {
    res.jsonBad(e.message);
  });
};
