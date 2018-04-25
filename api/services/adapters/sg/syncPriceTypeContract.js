'use strict';

const ISync = require('./isync'),
  priority = 3;

class SyncPriceTypeContract extends ISync {
  constructor() {
    super();

    this.resource = 'pricetype';
    this.priority = priority;
  }

  sync(resourceId, authToken) {
    const resourceRelativeUrl = `api/resources/objects/${this.resource}/${resourceId}`;

    return IntegrationAPI.buildRequest('GET', resourceRelativeUrl, authToken).then(respResource => {
      const {success, [this.resource]: {storeId, contractExternalKey, scope, contractId} = {}} = respResource || {};

      if (!success || !storeId) {
        return;
      }

      const query = encodeURIComponent(JSON.stringify({storeId, externalKey: contractExternalKey}));

      return Promise.all([
        scope,
        contractId,
        IntegrationAPI.buildRequest('GET', `api/resources/objects/contract?query=${query}`, authToken)
      ]);
    }).then(([scope, contractId, {success, contract} = {}]) => {
      if (!success) {
        return;
      }

      const [newScope, newContractId] = contract.length ? [contract[0].scope, contract[0].id] : [[], null];

      // check if scope and contract id are changed
      if (scope[0] === newScope[0] && contractId === newContractId) {
        return;
      }

      return IntegrationAPI.buildRequest('PUT', resourceRelativeUrl, authToken, {
        body: {
          scope: newScope,
          contractId: newContractId
        }
      });
    });
  }
}

module.exports = SyncPriceTypeContract;
