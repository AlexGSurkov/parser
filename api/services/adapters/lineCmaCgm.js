'use strict';

const ILine = require('./iline');

class LineCmaCgm extends ILine {
  constructor() {
    super();

    this.lineName = 'CMA-CGM';
  }

  async search(searchNumber) {
    let parseResult = {};

    if (searchNumber.trim()) {
      // test searching number for Bill of Lading, Booking or container
      parseResult = await this.parse(`http://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=BL&Reference=${searchNumber}`, searchBL);

      parseResult.result && (parseResult.result.billOfLadingNumber = searchNumber);

      if (!parseResult.result) {
        parseResult = await this.parse(`http://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=Booking&Reference=${searchNumber}`, searchBL);

        parseResult.result && (parseResult.result.shipmentNumber = searchNumber);
      }

      // test searchNumber as number of container
      if (!parseResult.result) {
        parseResult = await this.parse(`http://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=Container&Reference=${searchNumber}`, containerDetails);
      }

      //console.log(parseResult.result);

      if (parseResult.result.containers && parseResult.result.containers.length && !parseResult.result.containers[0].currentState) {
        const containers = await Promise.all(parseResult.result.containers.map(({number}) => this.parse(`http://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=Container&Reference=${number}`, containerDetails)));

        //console.log('containers', containers[0].result);

        parseResult.result.containers = containers.map(({result}) => result.containers[0]);
      }

      //parseResult.result && (parseResult.result.containers[0].number = searchNumber);

      if (!parseResult.result) {
        this.error(`Reference ${searchNumber} is not valid.`);

        parseResult.result = {};
      }

      //console.log(parseResult.result);

      return parseResult.result;

    }

    this.error(`Needs searching number for ${this.lineName}`);

    return parseResult;
  }

}

module.exports = LineCmaCgm;

/* eslint-disable */

function searchBL() {
  try {
    var elements,
      result = {
        containers: [],
        shipmentNumber: null,
        billOfLadingNumber: null
      };

    // check results
    elements = document.getElementsByTagName('h2');
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML.toLowerCase().indexOf('no results') > -1) {
        return false;
      }
    }

    // get containers
    if (document.getElementById('containerList')) {
      elements = document.getElementById('containerList').getElementsByTagName('ul')[0].children;
      for (var i = 0; i < elements.length; i++) {
        result.containers.push({
          number: elements[i].children[0].innerHTML
        });
      }
    } else {
      elements = document.getElementsByTagName('h1');
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].innerHTML.toLowerCase().indexOf('tracking details for container') > -1) {
          result.containers.push({
            number: elements[i].innerHTML.trim().substring(31, elements[i].innerHTML.trim().indexOf('\t') - 1)
          });
        }
      }
    }

    return result;
  } catch (e) {
    return {
      error: e.message
    };
  }
}

function containerDetails() {
  try {
    var elements, sub1, locationIdx,
      result = {
        containers : [{
          locations: [],
          number: '',
          type: '',
          eta: '',
          currentState: []
        }]
      };

    // check results
    elements = document.getElementsByTagName('h2');
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML.toLowerCase().indexOf('no results') > -1) {
        return false;
      }
    }

    // get number
    elements = document.getElementsByTagName('h1');
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML.toLowerCase().indexOf('tracking details for container') > -1) {
        result.containers[0].number = elements[i].innerHTML.trim().substring(31, elements[i].innerHTML.trim().indexOf('<!')).trim();
      }
    }

    // get current status
    elements = document.getElementsByClassName('medium-mega');
    if (elements.length === 1) {
      elements = elements[0].getElementsByTagName('tr');
      result.containers[0].currentState.push(elements[0].children[1].innerHTML);
      // if current status is "Discharged" there isn't date
      if (elements.length > 1) {
        result.containers[0].currentState.push(elements[1].children[1].innerHTML);
      }
    }

    //get type
    elements = document.getElementsByClassName('maxi');
    if (elements.length === 1) {
      elements = elements[0].getElementsByTagName('tr');
      result.containers[0].type = elements[0].children[1].innerHTML + ' ' + elements[1].children[1].innerHTML;
    }

    // get container
    elements = document.getElementsByClassName('small-data-table')[0].getElementsByTagName('li');
    for (var i = 0; i < elements.length; i++) {
      var period = '',
        date = elements[i].children[0].children[0].innerHTML,
        location = elements[i].children[0].children[1].innerHTML,
        voyage = '',
        state = [];

      date = date.substring(date.lastIndexOf('>') + 1);
      location = location.substring(location.lastIndexOf('>') + 1).trim();

      // container status
      state.push(elements[i].children[2].children[1].innerHTML);

      // vessel
      if (elements[i].children[3].children[0].children[1].children.length) {
        state.push(elements[i].children[3].children[0].children[1].children[0].innerHTML.trim());
      } else {
        state.push(elements[i].children[3].children[0].children[1].innerHTML.trim());
      }

      // Voyage
      voyage = {
        href: elements[i].children[3].children[1].children[1].children[0].href,
        number: elements[i].children[3].children[1].children[1].children[0].innerHTML.trim()
      };

      switch(elements[i].className) {
        case 'date-past':
          period = 'past';
          break;
        case 'date-current':
          period = 'current';
          break;
        case 'date-provisional':
          period = 'future';
      }

      result.containers[0].locations.push({
        period: period,
        date: date,
        location: location,
        voyage: voyage,
        state: state
      });
    }

    result.containers.forEach(function(container) {
      var locations = {};

      for (var i = 0; i < container.locations.length; i++) {
        if (!locations[container.locations[i].location]) {
          locations[container.locations[i].location] = {};
          locations[container.locations[i].location].location = container.locations[i].location;
          locations[container.locations[i].location].states = [];
        }

        locations[container.locations[i].location].states.push({
          date: container.locations[i].date,
          period: container.locations[i].period,
          voyage: container.locations[i].voyage,
          state: container.locations[i].state
        });
      }

      container.locations = Object.keys(locations).map(function(key) {
        return locations[key];
      });

    });

    return result;
  } catch (e) {
    return {
      error: e.message
    };
  }
}

/* eslint-enable */
