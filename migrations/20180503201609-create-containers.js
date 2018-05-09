'use strict';

const Promise = require('bluebird'),
  fs = require('fs'),
  path = require('path');

Promise.promisifyAll(fs);

module.exports = {
  up(queryInterface, Sequelize) {
    return migration(queryInterface, Sequelize, '/sqls/20180503201609-create-containers-up.sql');
  },

  down(queryInterface, Sequelize) {
    return migration(queryInterface, Sequelize, '/sqls/20180503201609-create-containers-down.sql');
  }
};

function migration(queryInterface, Sequelize, filename) {
  return fs.readFileAsync(path.join(__dirname, filename), {encoding: 'utf-8'}).then(content => {
    return queryInterface.sequelize.transaction(transaction => {
      return queryInterface.sequelize.query(content, {transaction});
    });
  });
}
