'use strict';

module.exports = {

  models: {
    connection: 'dev'
  },

  hookTimeout: 60000,

  port: process.env.PORT || 10000,

  megapassword: '$2a$08$70NV8ktqrk/T6nHky1obS.Hj4Nly4yG5YKO5psGHIaxkcE5cDaoLq',

  considerHolidaysAndWeekendsInMetricsCalcs: true

};
