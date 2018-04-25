'use strict';

const _ = require('lodash');

/**
 * List of ports to lift sails in tasks
 * Needed for posibility to run few tasks (with sails instances) simultaneously
 *
 * Reverse order needed to control duplicate ports in IDE
 */
const ports = {
  12346: 'apiTester',
  12347: 'asyncBatch',
  12348: 'createActivity',
  12349: 'migration',
  12350: 'smartFilters',
  12351: 'syncResources',
  12352: 'dataMonitoring',
  12353: 'email',
  12363: 'gaaCacheSync'
};

module.exports.sailsPortsToLift = _.invert(ports);
