'use strict';

module.exports = {

  models: {
    connection: 'test'
  },

  hookTimeout: 60000,

  microservices: {
    allInclusive: 'localhost:1337',
    integrationAPI: 'localhost:1337',
    analytics: 'localhost:1338',
    GAA: 'localhost:1337',
    apiGateway: 'localhost:1337'
  },

  port: process.env.PORT || 1337,

  considerHolidaysAndWeekendsInMetricsCalcs: true,

  log: {
    // disable sails logging
    custom: {
      log: () => {/* empty func */}
    },
    level: 'error',
    inspect: false
  }
};
