'use strict';

module.exports.hand = {
  /**
   * User fields not needed for hand
   */
  userExcludeFields: [
    'active',
    'createdAt',
    'email',
    'errors',
    'hasErrors',
    'login',
    'password',
    'pin',
    'pinExpired',
    'updatedAt'
  ],
  /**
   * Data which will excluded from info about store when user have initial data after signing
   * and will sending to Hand for query full information about store
   */
  storesDataExcluded: [
    'orders',
    'storeContacts'
  ],
  /**
   * Store's info user must have in initial data after signing
   */
  storesFieldsIncluded: [
    'actualAddress',
    'actualName',
    'id',
    'legalAddress',
    'legalName',
    'scope',
    'shortName',
    'SWCode'
  ]
};
