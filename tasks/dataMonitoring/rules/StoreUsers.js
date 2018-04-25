'use strict';

function checkStores(stores, logger) {
  stores.forEach(store => {
    if (!store.users || !store.users.length) {
      logger.addLog(store.id, 'No users');
    }
  });
}

module.exports.run = function(DataExtractor, Logger) {
  let logger = new Logger('Store');
  let storeQuery = {
    attributes: ['id'],
    include: [
      {
        model: 'User',
        as: 'users',
        attributes: ['id'],
        required: false
      }
    ]
  };

  return DataExtractor.getModelData('Store', storeQuery, stores => checkStores(stores, logger)).then(() => logger.saveData());
};
