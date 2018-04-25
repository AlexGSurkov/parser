'use strict';

function checkStores(stores, logger) {
  stores.forEach(store => {
    if (!store.storeGrades || !store.storeGrades.length) {
      logger.addLog(store.id, 'No store grades');
    }
  });
}

module.exports.run = function(DataExtractor, Logger) {
  let logger = new Logger('Store');
  let storeQuery = {
    attributes: ['id'],
    include: [
      {
        model: 'StoreGrade',
        as: 'storeGrades',
        attributes: ['id'],
        required: false
      }
    ]
  };

  return DataExtractor.getModelData('Store', storeQuery, stores => checkStores(stores, logger)).then(() => logger.saveData());
};
