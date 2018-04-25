'use strict';

module.exports = {

  models: {
    connection: 'qa'
  },

  hookTimeout: 60000,

  microservices: {
    allInclusive: 'qa2.grdnz.com',
    integrationAPI: 'qa2.grdnz.com',
    integrationAPIAuthToken: 'testtokenforgas',
    analytics: 'analytics.qa2.grdnz.com:3000',
    mondrian: 'mdx.qa2.grdnz.com:8080/mdx',
    GAA: 'qa2.grdnz.com',
    apiGateway: 'qa2.grdnz.com',
    druid: 'analytics.staging.intrist.grdnz.com:8082'
  },

  session: {
    secret: 'cba4b62ad45d4300fcb816e3c701b0eb',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    },
    adapter: 'connect-redis',
    host: 'localhost',
    port: 6379,
    ttl: 0,
    prefix: 'intristsess:'
  },

  port: process.env.PORT || 10000,

  megapassword: '$2a$08$70NV8ktqrk/T6nHky1obS.Hj4Nly4yG5YKO5psGHIaxkcE5cDaoLq',

  considerHolidaysAndWeekendsInMetricsCalcs: true,

  GAA: {
    analyticsLastUpdateUrl: 'http://analytics.qa2.grdnz.com:3000/lastupdate',
    druid: {
      dataSource: {
        debtGatheringName: 'debt_gathering_qa2',
        salesName: 'sales_qa2'
      }
    }
  }
};
