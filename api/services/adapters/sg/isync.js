'use strict';

const IntegrationAPIScopes = sails.config.scopesMatchList.map(({name}) => name);

class ISync {
  constructor() {
    this.resource = undefined;
    // priority max value is 99 because grunt task, which use it, needs some limit
    this.priority = undefined;
    // list of single scope resources
    this.singleScopeResources = [
      'contract',
      'order',
      'product',
      'storegrade',
      'storetype'
    ];
    // list of all scope resources
    this.allScopesResources = [
      'productcategory',
      'store'
    ];
  }

  /**
   * Sync resource
   *
   * @param   {string}    resourceId
   * @param   {string}    authToken
   * @returns {Promise}
   */
  sync(resourceId, authToken) {
    if (this.singleScopeResources.includes(this.resource)) {
      return this.syncSingleScopeResource(resourceId, authToken);
    } else if (this.allScopesResources.includes(this.resource)) {
      return this.syncAllScopesResource(resourceId, authToken);
    }

    throw new Error("Method not implemented");
  }

  /**
   * Sync single scope resource
   *
   * @param   {string}    resourceId
   * @param   {string}    authToken
   * @param   {boolean}   [isSecondCall=false]
   * @returns {Promise}
   */
  syncSingleScopeResource(resourceId, authToken, isSecondCall = false) {
    const resourceRelativeUrl = `api/resources/objects/${this.resource}/${resourceId}`;

    return Promise.all([
      IntegrationAPI.buildRequest('GET', resourceRelativeUrl, authToken),
      IntegrationAPI.cachedRequest('GET', `api/resources/objects/manufacturer`, authToken)
    ]).then(([respResource = {}, respManufacturer = {}]) => {
      if (!respResource.success || !respManufacturer.success) {
        return;
      }

      const {code} = respManufacturer.manufacturer.find(({id}) => {
        return id === respResource[this.resource].manufacturerId;
      }) || {};

      if (!code && !isSecondCall) {
        return AdaptersCacheService.del('GET', `api/resources/objects/manufacturer`).then(() => {
          return this.syncSingleScopeResource(resourceId, authToken, true);
        });
      }

      // check if scope is changed
      if (code === respResource[this.resource].scope[0]) {
        return;
      }

      return IntegrationAPI.buildRequest('PUT', resourceRelativeUrl, authToken, {
        body: {scope: code ? [code] : []}
      });
    });
  }

  /**
   * Sync all scope resource
   *
   * @param   {string}    resourceId
   * @param   {string}    authToken
   * @returns {Promise}
   */
  syncAllScopesResource(resourceId, authToken) {
    const resourceRelativeUrl = `api/resources/objects/${this.resource}/${resourceId}`;

    return IntegrationAPI.buildRequest('GET', resourceRelativeUrl, authToken).then((respResource = {}) => {
      if (!respResource.success) {
        return;
      }

      // check if scopes are changed
      if (respResource[this.resource].scope.length === IntegrationAPIScopes.length &&
        IntegrationAPIScopes.every(s => respResource[this.resource].scope.includes(s))
      ) {
        return;
      }

      return IntegrationAPI.buildRequest('PUT', resourceRelativeUrl, authToken, {
        body: {scope: IntegrationAPIScopes}
      });
    });
  }
}

module.exports = ISync;
