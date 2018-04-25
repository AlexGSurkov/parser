'use strict';

/* eslint-disable no-magic-numbers */

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
let config = {
  /*
   * Set to false to stop the agent from starting up.
   */
  agent_enabled: false,
  /*
   * Sets the default Apdex T for your app, in seconds. Generally, you should set
   * this via server-side config. The 100 milliseconds default is lower than standard
   * New Relic Apdex settings, but Node.js apps tend to be more latency-sensitive than others.
   */
  apdex_t: 0.100,
  /**
   * Array of application names.
   */
  app_name: ['APIGateway basic'],
  /**
   * Your New Relic license key.
   */
  license_key: '983ef43372e3dd7488f0501e0798ecd5170c17ef',
  logging: {
    /**
     * Level at which to log. Can be error, warn, info, debug or trace.
     * 'trace' is most useful to New Relic when diagnosing issues with the agent,
     * 'info' and higher will impose the least overhead on production applications.
     */
    // level: 'info'

    /**
     * Disable logging to process.cwd() and newrelic_agent.log
     */
    enabled: false
  },
  rules: {
    ignore: ['^/socket.io.*']
  }
};

if ([
  'stvgroup-production',
  'stvgroup-staging',
  'aretail-production',
  'staging'
].includes(process.env.NODE_ENV_PRODUCTION)) {
  Object.assign(config, {
    agent_enabled: true,
    app_name: [`APIGateway ${process.env.NODE_ENV_PRODUCTION}`]
  });
}

exports.config = config;
