'use strict';

const ILine = require('./iline');

class LineZim extends ILine {
  constructor() {
    super();

    this.lineName = 'ZIM';
  }

  async search(searchNumber) {
    const maxDelay = 10000,
      stepDelay = 1000;

    let parseResult = {},
      delay = 3000,
      needsMoreDelay = true;

    if (searchNumber.trim()) {
      while (needsMoreDelay && delay < maxDelay) {
        // test searching number for Bill of Lading, Booking or container
        parseResult = await this.parse(`http://www.zim.com/pages/findcontainer.aspx?searchvalue1=${searchNumber}`, searchBL, false, delay);

        needsMoreDelay = parseResult.result.needsMoreDelay; // eslint-disable-line prefer-destructuring

        needsMoreDelay && (delay += stepDelay) && this.info(`Don't have right content for ${searchNumber}. Trying to download page again with ${delay} delaying`);
      }

      //console.log(parseResult.result);
      //
      //return parseResult.result;

      if (parseResult.result && !parseResult.result.error && parseResult.result.containers.length) {
        // searchNumber is Bill of Lading
        let {containers} = parseResult.result;

        //console.log(JSON.stringify(containers));

        await asyncForEach(containers, async container => {
          let containerResult = {};

          needsMoreDelay = true;
          delay = 3000; // eslint-disable-line no-magic-numbers

          while (needsMoreDelay && delay < maxDelay) {
            // search container
            containerResult = await this.parse(`http://www.zim.com/pages/findcontainer.aspx?searchvalue1=${container.number}`, containerDetails, false, delay);

            needsMoreDelay = containerResult.result.needsMoreDelay; // eslint-disable-line prefer-destructuring

            needsMoreDelay && (delay += stepDelay) && this.info(`Don't have right content for ${container.number}. Trying to download page again with ${delay} delaying`);
          }

          //console.log(JSON.stringify(containerResult.result));

          if (containerResult.result.number) {
            container.number = containerResult.result.number;
            container.locations = containerResult.result.locations;
          }
        });
      } else {
        // searchNumber is container number probably, test it
        if (parseResult.page) { // eslint-disable-line no-lonely-if
          let containerResult = await this.parse(parseResult.page, containerDetails);

          if (containerResult.result.number) {
            let currentLocation = [],
              currentDateDiff = null,
              today = new Date();

            containerResult.result.locations.forEach(location => {
              location.states.forEach(state => {
                // initiate
                currentDateDiff === null && today - new Date(state.date) > 0 && (currentDateDiff = today - new Date(state.date));

                if (currentDateDiff > 0 && currentDateDiff >= today - new Date(state.date) && today - new Date(state.date) > 0) {
                  currentDateDiff = today - new Date(state.date);
                  currentLocation = [location, state];
                }
              });
            });

            currentLocation.length && (containerResult.result.currentState = [currentLocation[1].state, currentLocation[1].date, currentLocation[0].location]);

            parseResult.result.containers = [containerResult.result];
          }

          //console.log(containerResult);
          //console.log(JSON.stringify(containerResult.result));
        }
      }

      delete parseResult.result.needsMoreDelay;

      return parseResult.result && (parseResult.result.billOfLadingNumber || parseResult.result.billOfLadingNumber ||
        parseResult.result.containers && parseResult.result.containers.length) ? parseResult.result : {};

    }

    this.error(`Needs searching number for ${this.lineName}`);

    return parseResult;
  }

}

module.exports = LineZim;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/* eslint-disable */

function searchBL() {
  try {
    var elements, tbl,
      result = {
        containers: [],
        shipmentNumber: null,
        billOfLadingNumber: null,
        needsMoreDelay: false
      };

    elements = document.getElementsByClassName('searchValueTitle');

    if (elements.length) {
      if (elements[0].innerHTML.indexOf('B/L number:') > -1) {
        result.billOfLadingNumber = elements[0].innerHTML.substring(12);

        tbl = document.getElementById('ctl00_SPWebPartManager1_g_38d2bc51_5585_4f8a_ac53_a92bb5037412_ctl00_gridConsignmentDetails');

        if (tbl) {
          elements = tbl.children[0].children;

          for (var i = 1; i < elements.length; i++) {
            if (elements[i].className === 'height' || elements[i].className === 'height gray') {
              result.containers.push({
                number: elements[i].children[0].children[0].innerHTML.substring(elements[i].children[0].children[0].innerHTML.lastIndexOf('>') + 1).trim(),
                currentState: [
                  elements[i].children[1].innerHTML.trim(),
                  elements[i].children[4].innerHTML.trim(),
                  elements[i].children[2].innerHTML.trim()
                ],
                type: elements[i].children[3].innerHTML.trim()
              });
            } else {
              break;
            }
          }
        } else {
          result.shipmentNumber = 'no table';
        }
      }

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


function containerDetails() {
  try {
    var elements, tbl, sub1, locationIdx,
      result = {
        locations: [],
        number: '',
        type: '',
        eta: '',
        currentState: [],
        needsMoreDelay: false
      };

    elements = document.getElementsByClassName('searchValueTitle');

    //result.length = elements.length;
    //return result;

    if (elements.length) {
      if (elements[0].innerHTML.indexOf('Container number:') > -1) {
        result.number = elements[0].innerHTML.substring(18);

        // get container type
        tbl = document.getElementById('ctl00_SPWebPartManager1_g_38d2bc51_5585_4f8a_ac53_a92bb5037412_ctl00_p5Value');

        if (tbl) {
          result.type = tbl.innerHTML;
        }

        tbl = document.getElementById('ctl00_SPWebPartManager1_g_38d2bc51_5585_4f8a_ac53_a92bb5037412_ctl00_gridRoutingDetails');

        if (tbl) {
          var location = {
              states: []
            },
            locationPlace = '';

          elements = tbl.getElementsByTagName('tr');

          for (var i = 1; i < elements.length; i++) {
            if (locationPlace !== elements[i].children[1].innerHTML.trim()) {
              if (locationPlace) {
                result.locations.push(location);
                location = {
                  states: []
                };
              }

              locationPlace = elements[i].children[1].innerHTML.trim();
              location.location = locationPlace;
            }

            location.states.push({
              state: elements[i].children[0].innerHTML,
              date: elements[i].children[2].innerHTML,
              voyage: {
                href: elements[i].children[3].children[0].href,
                number: elements[i].children[3].children[0].innerHTML.trim()
              }
            });
          }

          result.locations.push(location);
        }
      }

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
