const newrelic = require('newrelic');

module.exports = function(sails) {

  return {
    // Pause sails lifting until this hook has completed initializing
    ready: false,

    initialize(next) {
      sails.on('router:route', route => {
        if (route.req.options && route.req.options.controller) {
          newrelic.setControllerName(route.req.options.controller, route.req.options.action);
        }
      });

      this.ready = true;
      return next();
    }
  };
};
