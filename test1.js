'use strict';

/* eslint-disable */

const TrackingService = require('./api/services/TrackingService');

(async () => {
  console.log(await TrackingService.addVessels([]));
})();

/* eslint-enable */
