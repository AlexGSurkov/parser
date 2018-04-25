'use strict';

if (process.env.NODE_ENV_PRODUCTION) {
  module.exports = require('./' + process.env.NODE_ENV_PRODUCTION + '.js');
}

