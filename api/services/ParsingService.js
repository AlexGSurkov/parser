'use strict';

const lines = require('./adapters/index');

let LINES = {};

Object.keys(lines).forEach(line => LINES[line] = new lines[line]());

module.exports = {
  getLines() {
    return Object.keys(LINES).map(line => LINES[line].getLineName());
  },

  async searchNumberByLine(line, number) {
    const lineName = Object.keys(LINES).filter(lineKey => LINES[lineKey].getLineName() === line);

    if (!lineName.length) {
      throw new Error(`"${line}" not found`);
    }


    let result = {};

    try {
      result = await LINES[lineName[0]].search(number);
    } catch (e) {
      //console.log(`Error: "${e.message}"`);
      //todo
      //send error to frontend
      console.error(e);
    } finally {
      await LINES[lineName[0]].exit();
    }

    return result;
  }
};
