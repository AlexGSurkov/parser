'use strict';

let _ = require('lodash');


/**
 * Check intersection of order scope with user scope
 *
 * @param {{id, scope, user}[]} orders
 * @param {Logger}              logger
 */
function checkOrders(orders, logger) {
  orders.forEach(order => {

    // It's make sense only if user and order has any scope
    if (_.isEmpty(order.scope) && _.isEmpty(order.user.scope)) {
      return false;
    }

    let allBad = _.chain(order.user)
      .get('scope', [])
      .intersection(order.scope)
      .isEmpty()
      .value();

    if (allBad) {
      logger.addLog(order.id, _.isEmpty(order.scope) ? `Hasn't any scope, but user has` : `Has scope "${order.scope.toString()}", but user doesn't has it`);
    }

  });
}

module.exports.run = function(DataExtractor, Logger) {
  let logger = new Logger('Order');
  let orderQuery = {
    attributes: ['id', 'scope'],
    scope: null,
    include: [
      {
        model: 'User',
        as: 'user',
        scope: null,
        attributes: ['id', 'scope'],
        required: true
      }
    ]
  };

  return DataExtractor.getModelData('Order', orderQuery, orders => checkOrders(orders, logger)).then(() => logger.saveData());
};
