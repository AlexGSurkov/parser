'use strict';

const logger = require('../../libs/logger'),
  {Slack} = require('slack-winston'),
  // get instance name for slack messages header
  instanceName = process.env.NODE_ENV_PRODUCTION || process.env.NODE_ENV || 'development';

logger.add(Slack, {
  message: `${instanceName}::APIGateway\n\n{{level}}: {{message}}\n\n{{meta}}`,
  domain: 'gardenize.slack.com',
  webhook_url: 'https://hooks.slack.com/services/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',
  icon_emoji: ':panda_face:',
  username: 'alerts-bot',
  channel: 'prod_alerts',
  level: 'warn'
});

module.exports = {

  models: {
    connection: 'production'
  },

  hookTimeout: 60000,

  microservices: {
    allInclusive: 'stvgroup.grdnz.com',
    integrationAPI: 'stvgroup.grdnz.com',
    integrationAPIAuthToken: 'testtokenforgas',
    analytics: 'analytics.stvgroup.grdnz.com:3000',
    mondrian: 'mdx.stvgroup.grdnz.com:8080/mdx',
    druid: 'analytics.stvgroup.grdnz.com:8082',
    GAA: 'stvgroup.grdnz.com',
    apiGateway: 'stvgroup.grdnz.com'
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
    analyticsLastUpdateUrl: 'http://analytics.stvgroup.grdnz.com:3000/lastupdate'
  },

  integrationapi: {
    batchRequestConcurency: 100
  },

  log: {
    custom: logger,
    inspect: false
  },

  cors: {
    origin: 'http://stvgroup.grdnz.com, http://stvgroup-staging.grdnz.com',
    credentials: true
  }

};
