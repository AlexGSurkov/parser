'use strict';

const _ = require('lodash'),
  ISync = require('./isync'),
  IntegrationAPIScopes = _.map(sails.config.scopesMatchList, 'name'),
  priority = 2;

class SyncUserScope extends ISync {
  constructor() {
    super();

    this.resource = 'user';
    this.priority = priority;
  }

  sync(resourceId, authToken, isSecondCall = false) {
    const resourceRelativeUrl = `api/resources/objects/${this.resource}/${resourceId}`;

    return Promise.all([
      IntegrationAPI.buildRequest('GET', resourceRelativeUrl, authToken),
      IntegrationAPI.buildRequest('GET', 'api/resources/objects/usermanufacturer?query=' + JSON.stringify({userId: resourceId}), authToken),
      IntegrationAPI.cachedRequest('GET', `api/resources/objects/manufacturer`, authToken)
    ]).then(([respResource, respUserManufacturer, respManufacturer]) => {
      if (!(respResource.success && respUserManufacturer.success && respManufacturer.success)) {
        return;
      }

      let scope = _.difference(respResource[this.resource].scope, IntegrationAPIScopes),
        allManufacturersAreFound = true;

      respUserManufacturer.usermanufacturer.forEach(({manufacturerId: id}) => {
        const {code} = _.find(respManufacturer.manufacturer, {id}) || {};

        code ? !scope.includes(code) && scope.push(code) : allManufacturersAreFound = false;
      });

      if (!allManufacturersAreFound && !isSecondCall) {
        return AdaptersCacheService.del('GET', `api/resources/objects/manufacturer`).then(() => {
          return this.sync(resourceId, authToken, true);
        });
      }

      // check if scopes are changed
      if (respResource[this.resource].scope.length === scope.length &&
        scope.every(s => respResource[this.resource].scope.includes(s))
      ) {
        return;
      }

      return IntegrationAPI.buildRequest('PUT', resourceRelativeUrl, authToken, {
        body: {scope}
      });
    });
  }
}

module.exports = SyncUserScope;

