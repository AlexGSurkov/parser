'use strict';

const ISync = require('./isync'),
  priority = 2;

class SyncStoreGradeScope extends ISync {
  constructor() {
    super();

    this.resource = 'storegrade';
    this.priority = priority;
  }
}

module.exports = SyncStoreGradeScope;
