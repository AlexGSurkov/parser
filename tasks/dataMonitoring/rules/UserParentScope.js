'use strict';

let _ = require('lodash');

function checkUsers(users, logger) {
  users.forEach(user => {
    let allParentsScopesCountByName = _.chain(user.parents).map('scope').flatten().countBy().value();

    _.each(allParentsScopesCountByName, (count, scope) => {
      /*
       * If user has more then one parent from same scope and user belongs to this scope,
       * otherwise it rule have no sense
       */
      if (count > 1 && _.include(user.scope, scope)) {
        logger.addLog(user.id, `Has ${count} parents by "${scope}" scope.`);
      }
    });
  });
}

module.exports.run = function(DataExtractor, Logger) {
  let logger = new Logger('User');
  let usersQuery = {
    attributes: ['id', 'scope'],
    include: [
      {
        model: 'User',
        as: 'parents',
        attributes: ['id', 'scope'],
        required: false
      }
    ]
  };

  return DataExtractor.getModelData('User', usersQuery, users => checkUsers(users, logger)).then(() => logger.saveData());
};
