'use strict';

function checkStores(stores, logger) {
  stores.forEach(store => {
    if (!store.storeTypes || !store.storeTypes.length) {
      logger.addLog(store.id, 'No store types');
    }
  });
}

module.exports.run = function(DataExtractor, Logger) {
  let logger = new Logger('Store');
  let storeQuery = {
    attributes: ['id'],
    include: [
      {
        model: 'StoreType',
        as: 'storeTypes',
        attributes: ['id'],
        required: false
      }
    ]
  };

  return DataExtractor.getModelData('Store', storeQuery, stores => checkStores(stores, logger)).then(() => logger.saveData());
};
