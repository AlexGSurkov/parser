'use strict';

module.exports = (req, res, next) => {
  let token;

  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');

    if (parts.length == 2) {  // eslint-disable-line no-magic-numbers
      const scheme = parts[0],
        credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.jsonBadAPI('Authorization Token should be Bearer');
    }
  } else if (req.param('auth_token')) {
    token = req.param('auth_token');
  } else {
    return res.jsonBadAPI('Authorization Token not found');
  }
  // next();

  CustomerAuthToken.findOne({
    where: {token}
  }).then(result => {
    result ? next() : res.jsonBadAPI('Authorization Token not Found');
  }).catch(error => {
    sails.log.error('Authorization Error: ', error);

    return res.jsonBadAPI('Authorization Token Error');
  });

};
