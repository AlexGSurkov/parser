'use strict';

const ILine = require('./iline');

class LineZim extends ILine {
  constructor() {
    super();

    this.lineName = 'ZIM';
    this.blUrl = 'https://www.zim.com/tools/track-a-shipment?consnumber=';
  }

  getBLUrl(searchNumber) {
    return `https://www.zim.com/tools/track-a-shipment?consnumber=${searchNumber}`;
  }

  async search(searchNumber) {
    const maxDelay = 5000,
      stepDelay = 1000;

    let parseResult = {},
      delay = 1000,
      needsMoreDelay = true;

    if (searchNumber.trim()) {
      while (needsMoreDelay && delay < maxDelay) {
        // test searching number for Bill of Lading, Booking or container
        parseResult = await this.parse(this.getBLUrl(searchNumber), search, false, delay);

        needsMoreDelay = parseResult.result.needsMoreDelay; // eslint-disable-line prefer-destructuring

        needsMoreDelay && (delay += stepDelay) && this.info(`Don't have right content for ${searchNumber}. Trying to download page again with ${delay} delaying`);
      }

      //console.log(parseResult.result);

      if (parseResult.result.billOfLadingNumber && parseResult.result.containers.length) {
        const maxTime = parseResult.result.containers.length * 1500; // eslint-disable-line no-magic-numbers

        delay = parseResult.result.containers.length * 1000; // eslint-disable-line no-magic-numbers
        needsMoreDelay = true;

        while (needsMoreDelay && delay < maxTime) {
          // test searching number for Bill of Lading, Booking or container
          parseResult = await this.parse(parseResult.page, searchContainers, false, delay);

          needsMoreDelay = parseResult.result.needsMoreDelay; // eslint-disable-line prefer-destructuring

          needsMoreDelay && (delay += stepDelay) && this.info(`Don't have right content for ${searchNumber}. Trying to download page again with ${delay} delaying`);
        }

        //console.log(parseResult.result);
      }

      // needs deleting
      //return parseResult.result;

      delete parseResult.result.needsMoreDelay;

      return parseResult.result && (parseResult.result.billOfLadingNumber || parseResult.result.billOfLadingNumber ||
        parseResult.result.containers && parseResult.result.containers.length) ? parseResult.result : {};

    }

    this.error(`Needs searching number for ${this.lineName}`);

    return parseResult;
  }

}

module.exports = LineZim;

//async function asyncForEach(array, callback) {
//  for (let index = 0; index < array.length; index++) {
//    await callback(array[index], index, array);
//  }
//}

/* eslint-disable */

function search() {
  try {
    var elements, tbl, sub1,
      result = {
        containers: [],
        shipmentNumber: null,
        billOfLadingNumber: null,
        needsMoreDelay: false
      },
      container = {
        locations: [],
        currentState: []
      };

    elements = document.getElementsByClassName('progress-block');

    //result.shipmentNumber = elements.length;
    //
    //return result;

    if (elements.length) {
      sub1 = elements[0].children[0].getElementsByTagName('span');

      // B/L found
      if (sub1.length === 2 && sub1[0].innerHTML.indexOf('B/L NO.:') > -1) {
        //fill billOfLadingNumber
        sub1 = elements[0].children[0].getElementsByTagName('dd');
        result.billOfLadingNumber = sub1[0].innerHTML.substring(6);

        // containers info table
        elements = document.getElementsByClassName('routing-table');

        if (elements.length && elements.length === 1) {
          elements = elements[0].children[0].children;

          for (var i = 1; i < elements.length; i++) {
            sub1 = elements[i].getElementsByTagName('table');

            // load info about container
            sub1[0].click();

            result.containers.push({
              number: sub1[0].getAttribute('data-cont-id')
            });
          }
        }

        return result;
      }

      // todo обработать судно, параметр data-route-count предположительно - количество перегрузок (проверить)

      // container found
      if (sub1.length === 3 && sub1[0].innerHTML.indexOf('CONTAINER NO.:') > -1) {
        //number
        container.number = sub1[0].parentNode.parentNode.children[1].innerHTML.replace('&nbsp;', '');
        //type
        container.type = sub1[0].parentNode.parentNode.parentNode.children[1].children[1].innerHTML.replace('&nbsp;', '');
        //eta
        container.eta = {date: sub1[0].parentNode.parentNode.parentNode.parentNode.children[1].children[0].innerText.replace('ETA:', '').trim()};

        // container info table
        elements = document.getElementsByClassName('routing-table');

        if (elements.length && elements.length === 1) {
          sub1 = elements[0].children[0].children[1].getElementsByTagName('tr');

          //result.shipmentNumber = sub1.length;

          var states = [];

          // get all states
          for (var j = 0; j < sub1.length; j++) {
            var state = [],
              voyage = {};

            // check voyage
            if (sub1[j].children[3].children.length) {
              state = [sub1[j].children[0].innerHTML, sub1[j].children[3].children[0].innerHTML.trim()];
              voyage = {
                href: sub1[j].children[3].children[0].href
              };
            } else {
              state = [sub1[j].children[0].innerHTML];
            }

            states.push({
              state: state,
              date: sub1[j].children[2].innerHTML,
              voyage: voyage,
              location: sub1[j].children[1].innerHTML.trim()
            });
          }

          // define state period
          for (var k = 0; k < states.length; k++) {
            if (new Date(states[k].date) < new Date()) {
              states[k].period = 'past';
            } else {
              states[k].period = 'future';
            }

            if (states[k].period === 'future' && k > 0 && states[k-1].period === 'past') {
              states[k-1].period = 'current';
              container.currentState = [states[k-1].state[0], states[k-1].date, states[k-1].location];
            }

            if (k === states.length - 1 && states[k].period === 'past') {
              states[k].period = 'current';
              container.currentState = [states[k].state[0], states[k].date, states[k].location];
            }
          }

          var location = {
              states: []
            },
            locationPlace = '';

          // filter states by locations
          for (var j = 0; j < states.length; j++) {
            if (locationPlace !== states[j].location) {
              if (locationPlace) {
                container.locations.push(location);
                location = {
                  states: []
                };
              }

              locationPlace = states[j].location;
              location.location = locationPlace;
            }

            // delete field which unused more
            delete states[j].location;

            location.states.push(states[j]);
          }

          // add last location
          container.locations.push(location);
        }

        result.containers.push(container);
      }

      return result;
    } else {
      result.needsMoreDelay = true;
    }

    return result;
  } catch(e) {
    return {
      error: e.message
    };
  }
}

function searchContainers() {
  try {
    var elements, tbl, sub1,
      eta = {},
      result = {
        containers: [],
        shipmentNumber: null,
        billOfLadingNumber: null,
        needsMoreDelay: false
      };

    elements = document.getElementsByClassName('progress-block');

    //result.billOfLadingNumber = elements.length;
    //
    //return result;

    if (elements.length) {
      sub1 = elements[0].children[0].getElementsByTagName('span');

      if (sub1.length !== 2 || sub1[0].innerHTML.indexOf('B/L NO.:') === -1) {
        result.needsMoreDelay = true;

        return result;
      }

      sub1 = elements[0].children[0].getElementsByTagName('dd');

      result.billOfLadingNumber = sub1[0].innerHTML.substring(6);

      //ETA of BL (use for all containers)
      sub1 = elements[0].children[1].children[1].getElementsByTagName('dd');
      eta.pod = sub1[0].innerHTML;

      //ETA date
      sub1 = elements[0].children[1].children[1].getElementsByTagName('dt');
      if (sub1.length > 1) {
        eta.date = sub1[1].innerHTML.substring(19);
      }


      // todo обработать судно, параметр data-route-count предположительно - количество перегрузок (проверить)

      // containers info
      elements = document.getElementsByClassName('routing-table');

      if (elements.length && elements.length === 1) {
        elements = elements[0].children[0].children;

        // rows with containers info
        for (var i = 1; i < elements.length; i++) {
          // must be table & div with loaded details
          sub1 = elements[i].children[0].children;

          // check if div has details
          if (!sub1[1].children.length) {
            result.needsMoreDelay = true;

            return result;
          }

          var container = {
            locations: [],
            eta: JSON.parse(JSON.stringify(eta)),
            currentState: []
          };

          // fill container number
          container.number = sub1[0].getAttribute('data-cont-id');

          //type
          container.type = sub1[0].children[0].children[0].getElementsByTagName('span')[1].innerHTML;

          // get all states
          sub1 = sub1[1].children[0].getElementsByTagName('tr');

          //result.shipmentNumber = sub1.length;

          var states = [];

          // get all states
          for (var j = 0; j < sub1.length; j++) {
            var state = [],
              voyage = {};

            // check voyage
            if (sub1[j].children[4].children.length) {
              state = [sub1[j].children[1].innerHTML, sub1[j].children[4].children[0].innerHTML.trim()];
              voyage = {
                href: sub1[j].children[4].children[0].href
              };
            } else {
              state = [sub1[j].children[1].innerHTML];
            }

            states.push({
              state: state,
              date: sub1[j].children[3].innerHTML,
              voyage: voyage,
              location: sub1[j].children[2].innerHTML.trim()
            });
          }

          // define state period
          for (var k = 0; k < states.length; k++) {
            if (new Date(states[k].date) < new Date()) {
              states[k].period = 'past';
            } else {
              states[k].period = 'future';
            }

            if (states[k].period === 'future' && k > 0 && states[k-1].period === 'past') {
              states[k-1].period = 'current';
              container.currentState = [states[k-1].state[0], states[k-1].date, states[k-1].location];
            }

            if (k === states.length - 1 && states[k].period === 'past') {
              states[k].period = 'current';
              container.currentState = [states[k].state[0], states[k].date, states[k].location];
            }
          }

          var location = {
              states: []
            },
            locationPlace = '';

          // filter states by locations
          for (var j = 0; j < states.length; j++) {
            if (locationPlace !== states[j].location) {
              if (locationPlace) {
                container.locations.push(location);
                location = {
                  states: []
                };
              }

              locationPlace = states[j].location;
              location.location = locationPlace;
            }

            // delete field which unused more
            delete states[j].location;

            location.states.push(states[j]);
          }

          // add last location
          container.locations.push(location);

          result.containers.push(container);
        }
      }

      return result;


    } else {
      result.needsMoreDelay = true;
    }

    return result;
  } catch(e) {
    return {
      error: e.message
    };
  }
}

/* eslint-enable */
