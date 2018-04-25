'use strict';

const ISync = require('./isync'),
  priority = 2;

class SyncStoreTypeScope extends ISync {
  constructor() {
    super();

    this.resource = 'storetype';
    this.priority = priority;
  }
}

module.exports = SyncStoreTypeScope;
