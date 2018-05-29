'use strict';

const ILine = require('./iline');

class LineMaersk extends ILine {
  constructor() {
    super();

    this.lineName = 'MAERSK';
  }

  async search(searchNumber) {
    const maxDelay = 10000,
      stepDelay = 1000;

    let parseResult = {},
      delay = 1000,
      needsMoreDelay = true;

    if (searchNumber.trim()) {
      while (needsMoreDelay && delay < maxDelay) {
        parseResult = await this.parse(`https://my.maerskline.com/tracking/#tracking/${searchNumber}`, searchAll, false, delay);

        needsMoreDelay = parseResult.result.needsMoreDelay; // eslint-disable-line prefer-destructuring

        needsMoreDelay && (delay += stepDelay) && this.info(`Don't have right content for ${searchNumber}. Trying to download page again with ${delay} delaying`);
      }

    } else {
      this.error(`Needs searching number for ${this.lineName}`);
    }

    return parseResult.result;
  }

}

module.exports = LineMaersk;

/* eslint-disable */

function searchAll() {
  try {
    var elements, sub1, sub2, container, locationIdx, type,
      result = {
        containers: [],
        shipmentNumber: null,
        billOfLadingNumber: null
      };


    elements = document.getElementsByClassName('pt-results');

    //needsMoreDelay
    if (!elements.length || !elements[0].children.length) {
      result.needsMoreDelay = true;

      return result;
    }

    //check if no results
    if (elements[0].children.length && elements[0].children[0].tagName.toLowerCase() === 'h1' &&
      elements[0].children[0].innerHTML.toLowerCase().indexOf('no results found') > -1) {
      return result;
    }

    //result.shipmentNumber = elements[0].children[0].children[2].innerHTML;

    //define type (BL or container)
    if (elements[0].children.length && elements[0].children[0].children.length) {
      if (elements[0].children[0].children[2].children[0].innerHTML.toLowerCase().indexOf('transport document number') > -1) {
        type = 'billOfLadingNumber';
      }

      if (elements[0].children[0].children[2].children[0].innerHTML.toLowerCase().indexOf('container number') > -1) {
        type = 'container';
      }
    }

    if (type) {
      if (type === 'billOfLadingNumber') {
        // get Bill of lading No
        result.billOfLadingNumber = elements[0].children[0].children[2].children[1].innerHTML;
      }

      sub1 = document.getElementById('table_id');

      if (sub1) {
        // number of containers
        sub1 = sub1.children[1].children;

        //get details
        for (var i = 0; i < sub1.length; i++) {
          var container = {},
            separator = String.fromCharCode(8226),
            separatorPosition = -1,
            currentState = '';

          // number
          container.number = sub1[i].children[0].children[3].innerHTML;
          // type
          container.type = sub1[i].children[1].children[3].innerHTML;
          // ETA
          container.eta = {date: sub1[i].children[2].children[3].innerHTML};
          // current state
          container.currentState = [];
          currentState = sub1[i].children[3].children[3].innerHTML.replace('<br>', separator);

          separatorPosition = currentState.indexOf(separator);

          while (separatorPosition > -1) {
            container.currentState.push(currentState.substring(0, separatorPosition).trim());
            currentState = currentState.substring(separatorPosition + 1);
            separatorPosition = currentState.indexOf(separator);
          }

          if (currentState.length) {
            container.currentState.push(currentState.trim());
          }

          if (container.currentState.length === 3) {
            //move container.currentState[1] to container.currentState[2]
            container.currentState.splice(2, 0, container.currentState.splice(1, 1)[0]);
          }

          //get locations
          sub2 = sub1[i].children[4].children[0].children;
          container.locations = [];

          for (var j = 0; j < sub2.length; j++) {
            var cells = sub2[j].getElementsByTagName('tr'),
              location = cells[0].children[0].innerHTML.trim().replace('<br>', ', '),
              states = [];

            for (var k = 1; k < cells.length; k++) {
              var state = [],
                voyage = '',
                period = '',
                date = '';

              separatorPosition = cells[k].children[1].innerText.trim().indexOf('\n');
              //state.push(separatorPosition, cells[k].children[1].innerText.trim());

              if (separatorPosition > -1 && cells[k].children[1].children[1].className.indexOf('icon-vessel') > -1) {
                // separate state & vessel
                var vessel = cells[k].children[1].innerText.trim().substring(0, separatorPosition).trim();

                if (vessel.indexOf('Load on') > -1) {
                  state.push(vessel.substring(0, 7), vessel.substring(8));
                } else {
                  state.push(vessel);
                }

                voyage = cells[k].children[1].innerText.trim().substring(separatorPosition + 1).trim();
              } else {
                state.push(cells[k].children[1].innerText.trim().replace('\n', ' '));
              }

              date = cells[k].children[0].innerText.trim().replace('\n', ' ');

              if (new Date(date) < new Date()) {
                period = 'past';
              } else {
                period = 'future';
              }

              states.push({
                date: date,
                state: state,
                voyage: voyage,
                period: period
              });
            }

            container.locations.push({
              location: location,
              states: states
            });
          }

          //set current state
          var state = {period: ''};

          for (j = 0; j < container.locations.length; j++) {
            if (state.period === 'current') {
              break;
            }

            for (var k = 0; k < container.locations[j].states.length; k++) {
              if (state.period === 'past' && container.locations[j].states[k].period === 'future') {
                state.period = 'current';
                break;
              } else {
                state = container.locations[j].states[k];
              }
            }
          }

          result.containers.push(container);
        }
      }

    }

    return result;
  } catch(e) {
    //console.error(e.message);

    return {
      error: e.message
    };
  }
}

/* eslint-enable */
