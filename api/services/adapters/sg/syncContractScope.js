'use strict';

const ISync = require('./isync'),
  priority = 2;

class SyncContractScope extends ISync {
  constructor() {
    super();

    this.resource = 'contract';
    this.priority = priority;
  }
}

module.exports = SyncContractScope;
