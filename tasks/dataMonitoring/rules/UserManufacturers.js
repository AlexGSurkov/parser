'use strict';

function checkUsers(users, logger) {
  users.forEach(user => {
    if (!user.manufacturers || !user.manufacturers.length) {
      logger.addLog(user.id, 'No manufacturers');
    }
  });
}

module.exports.run = function(DataExtractor, Logger) {
  let logger = new Logger('User');
  let userQuery = {
    attributes: ['id'],
    include: [
      {
        model: 'Manufacturer',
        as: 'manufacturers',
        attributes: ['id'],
        required: false
      }
    ]
  };

  return DataExtractor.getModelData('User', userQuery, users => checkUsers(users, logger)).then(() => logger.saveData());
};
