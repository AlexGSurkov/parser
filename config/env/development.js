'use strict';

module.exports = {

  models: {
    connection: 'development'
  },

  hookTimeout: 60000,

  microservices: {
    allInclusive: 'localhost:1337',
    integrationAPI: 'localhost:1337',
    GAA: 'localhost:1337'
  },

  considerHolidaysAndWeekendsInMetricsCalcs: true

};
