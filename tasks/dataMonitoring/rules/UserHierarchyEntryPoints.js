'use strict';

const _ = require('lodash'),
  Sequelize = require('sequelize');

/**
 *
 * This rule should check that in root there is only one operator and no more root entry points for user hierarchy
 *
 */

/**
 * First of user to identify as operator
 */
const OPERATOR_FIRST_NAME = 'Operator';

function checkUsers(rootUsers, logger) {
  const operator = _.remove(rootUsers, {firstName: OPERATOR_FIRST_NAME});

  if (!operator.length) {
    logger.addLog('general-error-no-id', `There is no "${OPERATOR_FIRST_NAME}" on root in user hierarchy!`);
  }
  if (rootUsers.length) {
    logger.addLog('general-error-no-id', `There are more than one root user in hierarchy (${_.map(rootUsers, 'id').join(', ')})!`);
  }
}

module.exports.run = function(DataExtractor, Logger) {
  const logger = new Logger('User'),
    usersQuery = {
      attributes: ['id', 'firstName', 'lastName'],
      where: {
        id: [Sequelize.literal('SELECT DISTINCT "parentId" FROM intrist_user_users EXCEPT SELECT DISTINCT "userId" FROM intrist_user_users')]
      }
    };

  return DataExtractor.getModelData('User', usersQuery, rootUsers => checkUsers(rootUsers, logger)).then(() => logger.saveData());
};
