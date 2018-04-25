'use strict';

const ISync = require('./isync'),
  priority = 2;

class SyncProductCategoryScope extends ISync {
  constructor() {
    super();

    this.resource = 'productcategory';
    this.priority = priority;
  }
}

module.exports = SyncProductCategoryScope;
