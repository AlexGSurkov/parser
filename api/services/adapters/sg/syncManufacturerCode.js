'use strict';

const ISync = require('./isync'),
  priority = 1;

class SyncManufacturerCode extends ISync {
  constructor() {
    super();

    this.resource = 'manufacturer';
    this.priority = priority;
  }

  sync(resourceId, authToken) {
    const resourceRelativeUrl = `api/resources/objects/${this.resource}/${resourceId}`;

    return IntegrationAPI.buildRequest('GET', resourceRelativeUrl, authToken).then((respResource = {}) => {
      if (!respResource.success) {
        return;
      }

      const code = ScopeService.scopeAutoReplace(respResource[this.resource].name);

      // return if code not exist or not changed
      if (!code || code === respResource[this.resource].code) {
        return;
      }

      return IntegrationAPI.buildRequest('PUT', resourceRelativeUrl, authToken, {
        body: {code}
      });
    });
  }
}

module.exports = SyncManufacturerCode;
