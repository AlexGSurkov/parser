'use strict';

const fs = require('fs'),
  readline = require('readline');

/* eslint-disable */

const TrackingService = require('./api/services/TrackingService');

(async () => {
  const fileName = 'imo_data.csv';

  try {
    if (!fileName) {
      throw new Error('Needs param --fileName');
    }

    if (!fs.existsSync(fileName)) {
      throw new Error(`"${fileName}" not exists`);
    }

    let fileData = '';

    var rd = readline.createInterface({
      input: fs.createReadStream(fileName),
      //output: process.stdout,
      console: false
    });

    rd.on('line', function(line) {
      console.log(line);
    });

    //await fs.readFile(fileName, (err, data) => {
    //  fileData = data;
    //
    //  console.log(11111111111, data);
    //});

    //grunt.log.writeln(11111111111, fileData);

  } catch(error) {
    console.error(error);
  }
})();

/* eslint-enable */
