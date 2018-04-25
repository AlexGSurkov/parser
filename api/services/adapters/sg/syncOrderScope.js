'use strict';

const ISync = require('./isync'),
  priority = 2;

class SyncOrderScope extends ISync {
  constructor() {
    super();

    this.resource = 'order';
    this.priority = priority;
  }
}

module.exports = SyncOrderScope;
