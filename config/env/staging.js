'use strict';

const logger = require('../../libs/logger'),
  {Slack} = require('slack-winston'),
  // get instance name for slack messages header
  instanceName = process.env.NODE_ENV_PRODUCTION || process.env.NODE_ENV || 'development';

logger.add(Slack, {
  message: `${instanceName}::APIGateway\n\n{{level}}: {{message}}\n\n{{meta}}`,
  domain: 'gardenize.slack.com',
  webhook_url: 'https://hooks.slack.com/services/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',
  icon_emoji: ':koala:',
  username: 'alerts-bot',
  channel: 'winston',
  level: 'warn'
});

module.exports = {

  models: {
    connection: 'staging'
  },

  hookTimeout: 60000,

  microservices: {
    allInclusive: 'staging.intrist.grdnz.com',
    integrationAPI: 'staging.intrist.grdnz.com',
    integrationAPIAuthToken: 'testtokenforgas',
    analytics: 'analytics.staging.intrist.grdnz.com:3000',
    mondrian: 'mdx.staging.intrist.grdnz.com:8080/mdx',
    GAA: 'staging.intrist.grdnz.com',
    apiGateway: 'staging.intrist.grdnz.com',
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
    analyticsLastUpdateUrl: 'http://analytics.staging.intrist.grdnz.com:3000/lastupdate',
    druid: {
      dataSource: {
        debtGatheringName: 'debt_gathering_staging',
        salesName: 'sales_staging'
      }
    }
  },

  log: {
    custom: logger,
    inspect: false,
    // crucial app timings (used for alerts)
    warnTimings: {
      handCollect: 100000,         // 100 seconds
      appMetricsGathering: 90000,  // 90 seconds
      appsCache: 300000,           // 5 minutes
      singleIAPI: 5000,            // 5 seconds
      batchIAPI: 50000             // 50 seconds
    }
  },

  cors: {
    origin: 'http://staging.intrist.grdnz.com',
    credentials: true
  }

};
