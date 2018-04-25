'use strict';

/* eslint-disable no-magic-numbers */

const winston = require('winston'),
  customLevels = {
    levels: {
      error: 0,
      warn: 1,
      debug: 2,
      info: 3,
      verbose: 4,
      silly: 5
    },
    colors: {
      error: 'red',
      warn: 'yellow',
      debug: 'blue',
      info: 'green',
      verbose: 'cyan',
      silly: 'rainbow'
    }
  };

const winstonConsole = new winston.transports.Console({
  level: 'silly',
  colorize: true
});

const logger = new winston.Logger({
  levels: customLevels.levels,
  transports: [winstonConsole]
});

module.exports = logger;
