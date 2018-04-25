'use strict';

const es = require('event-stream'),
  Promise = require('bluebird'),
  MARGIN_OF_RANGE = 2,
  SUM_CONCURRENCY = 50,
  HANDLE_ENTRIES = 1000;

module.exports.run = function(DataExtractor, Logger) {
  let logger = new Logger('Order'),
    orderQuery = {
      attributes: ['id', 'totalSum']
    };

  return DataExtractor.getModelDataStream('Order', orderQuery).then(({dataStream, connection}) => {

    return new Promise((resolve, reject) => {
      let counter = 0,
        orderBuffer = [];

      let handledStream = dataStream.pipe(es.map((orderData, cb) => {
        counter++;
        if (counter % HANDLE_ENTRIES === 0) {
          console.info(`Handled ${counter} entries`);
        }

        cb(null, orderData);
        orderBuffer.push(orderData);

        if (orderBuffer.length % HANDLE_ENTRIES === 0) {
          console.info(`Buffer ${orderBuffer.length} entries`);
          dataStream.pause();

          Promise.map(orderBuffer, orderData => {
            return OrderProduct.find({
              attributes: [[OrderProduct.sequelize.fn('sum', OrderProduct.sequelize.col('totalSum')), 'total']],
              where: {
                orderId: orderData.id
              }
            }).then(sum => {
              // next line was commented due to dataMonitoringStarter.sh script error
              // console.info("Sum: ", sum.get('total'), " - ", orderData.totalSum);

              let bottomRangeOfOrderSum = orderData.totalSum - MARGIN_OF_RANGE,
                topRangeOfOrderSum = orderData.totalSum + MARGIN_OF_RANGE;

              if (!(sum.get('total') > bottomRangeOfOrderSum && sum.get('total') < topRangeOfOrderSum)) {
                logger.addLog(orderData.id, `Order.totalSum is "${orderData.totalSum}", but sum of all products is "${sum.get('total')}"`);
              }

            });

          },{concurrency: SUM_CONCURRENCY}).then(() => {
            orderBuffer=[];
            dataStream.resume();
          });
        }
      }));

      handledStream.on('end', () => {
        console.info(`Records: ${counter}`);
        SequelizeConnections[sails.config.models.connection].connectionManager.releaseConnection(connection);
        resolve();
      });

      handledStream.on('error', err => {
        SequelizeConnections[sails.config.models.connection].connectionManager.releaseConnection(connection);
        reject(new Error(`Error reading stream: ${err}`));
      });

    }).then(() => logger.saveData());

  });

};
