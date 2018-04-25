'use strict';

module.exports = function (grunt) {

  grunt.registerTask('dbcreate', function(){
    const done = this.async(),
        Promise = require("bluebird"),
        pg = Promise.promisifyAll(require('pg'), {multiArgs: true}),
        gruntDbConnect = require(__dirname + '/../../libs/gruntDbConnect');

    const conObj = gruntDbConnect.getConnection(),
        dbName = conObj.database;

    if (!dbName) {
      const err = 'Database name not found';

      grunt.log.writeln(err);
      return done(err);
    }

    grunt.log.writeln('Create database: "' + dbName + '"');
    const conUrl = gruntDbConnect.createConUrl({database: 'postgres'});

    if (conUrl) {
      grunt.log.writeln('Connection url: "' + conUrl + '"');

      const escapedDbName = dbName.replace(/\"/g, '""');

      pg.connectAsync(conUrl).spread(client => {
        return client.queryAsync('CREATE DATABASE "' + escapedDbName + '"');
      }).then(() => {
        grunt.log.writeln('Database "' + escapedDbName + '" was created');
        pg.end();
        done();
      }).catch(err => {
        grunt.log.writeln('Pg error: "' + err + '"');
        done(err);
      });

    } else {
      grunt.log.writeln('Connections not found');
      done();
    }
  });
};
