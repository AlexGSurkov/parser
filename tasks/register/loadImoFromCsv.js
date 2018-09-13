'use strict';

const fs = require('fs'),
  request = require('request-promise'),
  apiURL = 'http://localhost:1400/api';

//Promise.promisifyAll(fs);

module.exports = function(grunt) {
  grunt.registerTask('loadImoFromCsv', 'Load IMO to DB from .csv', async function(login, password) {
    const done = this.async(),
      fileName = grunt.option('fileName');

    try {
      if (!login || !password) {
        throw new Error('Needs login and password');
      }

      if (!fileName) {
        throw new Error('Needs param --fileName');
      }

      if (!fs.existsSync(fileName)) {
        throw new Error(`"${fileName}" not exists`);
      }

      const vessels = grunt.file.read(fileName).split('\n').filter(row => row.trim()).map(row => row.split(','));

      let res = await request.post({
        uri: `${apiURL}/auth`,
        json: true,
        body: {login, password}
      });

      if (res.status === 'error') {
        throw new Error(`Wrong authorization for ${login}: ${res.errorMsg}`);
      }

      const {token} = res.data;

      res = await request.post({
        uri: `${apiURL}/tracking/vessels?auth_token=${token}`,
        json: true,
        body: vessels
      });

      if (res.status === 'error') {
        throw new Error(`Data not saved to DB: ${res.errorMsg}`);
      }

      grunt.log.writeln('Success...');
    } catch (error) {
      grunt.log.error(error);
    } finally {
      done();
    }

  });
};
