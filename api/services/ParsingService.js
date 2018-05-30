'use strict';

const lines = require('./adapters/index'),
  Promise = require('bluebird');

let LINES = {};

Object.keys(lines).forEach(line => LINES[line] = new lines[line]());

module.exports = {
  getLines() {
    return Object.keys(LINES).map(line => LINES[line].getLineName());
  },

  async searchNumberByLine(line, number) {
    const lineName = Object.keys(LINES).filter(lineKey => LINES[lineKey].getLineName() === line);

    if (!lineName.length) {
      throw new Error(`Line "${line}" not found`);
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
  },

  async refreshContainers(containers) {
    let billOfLadingNumbers = {},
      containersWithoutBillOfLadingNumber = {};

    //отфильтровать контейнеры по коносаментам
    containers.forEach(container => {
      if (container.billOfLadingNumber) {
        if (!billOfLadingNumbers[container.billOfLadingNumber]) {
          billOfLadingNumbers[container.billOfLadingNumber] = {
            containers: {},
            line: container.line
          };
        }

        billOfLadingNumbers[container.billOfLadingNumber].containers[container.number] = container;
      } else {
        containersWithoutBillOfLadingNumber[container.number] = container;
      }
    });

    //console.log(billOfLadingNumbers, containersWithoutBillOfLadingNumber);

    //parse billOfLadings
    const billOfLadingResults = await Promise.map(Object.keys(billOfLadingNumbers), async key => { //eslint-disable-line no-unused-vars
      return await this.searchNumberByLine(billOfLadingNumbers[key].line, key);
    }, {concurrency: 1});

    //add container details to billOfLadingNumbers & containersWithoutBillOfLadingNumber
    billOfLadingResults.forEach(({billOfLadingNumber, containers}) => {
      containers.forEach(container => {
        container.billOfLadingNumber = billOfLadingNumber;
        //если распарсенного контейнера нет в billOfLadingNumbers, то попытаться найти его в containersWithoutBillOfLadingNumber
        if (billOfLadingNumbers[billOfLadingNumber] && billOfLadingNumbers[billOfLadingNumber].containers[container.number]) {
          Object.assign(billOfLadingNumbers[billOfLadingNumber].containers[container.number], container);
        } else {
          containersWithoutBillOfLadingNumber[container.number] && Object.assign(containersWithoutBillOfLadingNumber[container.number], container);
        }
      });
    });

    //todo
    //что делать с контейнером из коносамента, информацию по которому не запрашивали, но он есть в коносаменте?
    //возможно добавить его в БД

    //запросить состояние контейнеров из containersWithoutBillOfLadingNumber (или без детальной информации в billOfLadingNumbers)
    const containersResults = await Promise.map(Object.keys(containersWithoutBillOfLadingNumber).filter(key => !containersWithoutBillOfLadingNumber[key].currentState),
      async key => await this.searchNumberByLine(containersWithoutBillOfLadingNumber[key].line, key),
      {concurrency: 1}
    );

    containersResults.forEach(container => Object.assign(containersWithoutBillOfLadingNumber[container.number], container));

    return containers;
  }
};
