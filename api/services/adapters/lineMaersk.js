'use strict';

const ILine = require('./iline');

class LineMaersk extends ILine {
  constructor() {
    super();

    this.lineName = 'MAERSK';
  }

  async search(searchNumber) {
    let parseResult = {};

    if (searchNumber.trim()) {
      parseResult = await this.parse(`https://my.maerskline.com/tracking/search?keyType=UNKNOWN_TYPE&searchNumber=${searchNumber}`, searchAll);
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
    var elements, sub1, sub2, container, locationIdx,
      result = {
        containers: [],
        shipmentNumber: null,
        billOfLadingNumber: null
      };

    // get Shipment No
    elements = document.getElementsByTagName('h3');
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML.indexOf('Shipment No.') > -1) {
        result.shipmentNumber = elements[i].getElementsByTagName('a')[0].innerHTML;

        break;
      }
    }

    if (result.shipmentNumber) {
      // get Bill of lading No
      elements = document.getElementsByTagName('h4');
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].innerHTML.indexOf('Bill of lading No.') > -1) {
          result.billOfLadingNumber = elements[i].getElementsByTagName('a')[0].innerHTML;

          break;
        }
      }

      // get containers
      elements = document.getElementsByTagName('table');
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].className.indexOf('schedule-table') > -1 && elements[i].id.indexOf('container-no') > -1) {
          container = {id: elements[i].id};
          // loop by td
          sub1 = elements[i].getElementsByTagName('td');
          for (var k = 0; k < sub1.length - 1; k++) {
            sub2 = sub1[k].getElementsByTagName('span');
            if (sub2.length > 0) {
              for (var j = 0; j < sub2.length; j++) {
                // number
                if (sub2[j].className === 'tracking_container_id') {
                  container.number = sub2[j].innerHTML;
                }
                // type
                if (sub2[j].className === 'muted') {
                  container.type = sub2[j].innerHTML;
                }
                // ETA
                if (sub2[j].className === 'ETA-block') {
                  container.eta = {date: sub2[j].innerHTML};
                }
              }
            } else {
              container.currentState = [];
              for (var j = 0; j < sub1[k].children.length; j++) {
                container.currentState.push(sub1[k].children[j].innerHTML);
              }

            }
          }

          result.containers.push(container);
        }
      }

      // get details
      result.containers.forEach(function(cont) {
        //cont.test = 'more_info_' + cont.id.split('-')[2] + '_' + cont.id.split('-')[3];
        elements = document.getElementById('more_info_' + cont.id.split('-')[2] + '_' + cont.id.split('-')[3]).children[0].children[0].children;
        locationIdx = -1;
        cont.locations = [];
        for (var i = 0; i < elements.length; i++) {
          if (elements[i].tagName.toLowerCase() === 'h4') {
            locationIdx++;
            cont.locations[locationIdx] = {location: elements[i].innerHTML.replace('<span class=""></span>', ''), states: []};
          }
          else {
            if (elements[i].className.indexOf('past') > -1) {
              cont.locations[locationIdx].states.push({period: 'past'});
            }

            if (elements[i].className.indexOf('current') > -1) {
              cont.locations[locationIdx].states.push({period: 'current'});
            }

            if (elements[i].className.indexOf('future') > -1) {
              cont.locations[locationIdx].states.push({period: 'future'});
            }

            sub1 = elements[i].getElementsByTagName('tr')[0].getElementsByTagName('td');
            cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].date = sub1[2].innerHTML.trim().replace('<br>', ' ');
            sub2 = sub1[3].children;
            cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].state = [];
            for (var k = 0; k < sub2.length; k++) {
              cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].state.push(sub2[k].innerHTML);
            }

            if (cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].state.length === 4) {
              cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].voyage = cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].state[3];
              cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].voyage = {
                number: cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].voyage.substring(cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].voyage.indexOf(':') + 2)
              };
              cont.locations[locationIdx].states[cont.locations[locationIdx].states.length - 1].state.pop();
            }

          }
        }
      });
    } else {
      delete result.shipmentNumber;
      //console.error('Reference ' + searchNumber + ' is not valid.');
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
