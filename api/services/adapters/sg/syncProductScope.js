'use strict';

const ISync = require('./isync'),
  priority = 2;

class SyncProductScope extends ISync {
  constructor() {
    super();

    this.resource = 'product';
    this.priority = priority;
  }
}

module.exports = SyncProductScope;
