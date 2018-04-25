
module.exports.integrationapi = {
  // loggyToken: '82518f6e-e67f-4669-b816-c6288e1bd63d',
  // loggySubdomain: 'grdnztmp1',
  batchRequestConcurency: 50, // concurrent requests to the integrationAPI
  batchRequestLimit: 500, // maximum requests in one batch request
  cacheModels: true,
  defaultAdapter: 'sg',
  /**
   * Integration API logs timeout (7 days by default)
   */
  logsTimeout: 7 * 24 * 60 * 60 * 1000,
  /**
   * Actions that change resources
   */
  resourcesUpdateActions: ['create', 'update', 'destroy']
};
