'use strict';

module.exports = {

  models: {
    connection: 'production'
  },

  hookTimeout: 60000,

  microservices: {
    allInclusive: 'localhost',
    integrationAPI: 'intrist.grdnz.com',
    integrationAPIAuthToken: 'testtokenforgas',
    analytics: 'analytics.intrist.grdnz.com:3000',
    mondrian: 'mdx.intrist.grdnz.com:8080/mdx',
    GAA: 'intrist.grdnz.com',
    apiGateway: 'intrist.grdnz.com'
  },

  port: process.env.PORT || 10000,
  log: {
    level: 'silent'
  }
};
