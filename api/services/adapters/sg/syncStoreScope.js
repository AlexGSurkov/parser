'use strict';

const ISync = require('./isync'),
  priority = 2;

class SyncStoreScope extends ISync {
  constructor() {
    super();

    this.resource = 'store';
    this.priority = priority;
  }
}

module.exports = SyncStoreScope;
