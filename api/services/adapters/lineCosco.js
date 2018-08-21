'use strict';

const ILine = require('./iline');
//const util  = require('util');

class LineCosco extends ILine {
  constructor() {
    super();

    this.lineName = 'COSCO';
    this.urls = [
      'http://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=BILLOFLADING&number=',
      'http://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=BOOKING&number=',
      'http://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=CONTAINER&number='
    ];
  }

  async search(searchNumber) {

    const maxDelay = 10000,
      stepDelay = 1000;

    for (let i = 0; i < 3 ; i++) { // eslint-disable-line no-magic-numbers

      let parseResult = {},
        delay = 2000,
        needsMoreDelay = true;


      //this.url += '&number='+searchNumber;

      let currentUrl = this.urls[i]+searchNumber;
      //console.log(currentUrl);

      if (searchNumber.trim()) {

        parseResult = await this.parse(currentUrl, function(){/* empty */}, false, delay);

        delay = 2000; // eslint-disable-line no-magic-numbers

        while (needsMoreDelay && delay < maxDelay) {
          // test searching number for Bill of Lading, Booking or container
          parseResult = await this.parse(parseResult.page, getData, false, delay);

          needsMoreDelay = parseResult.result.needsMoreDelay; // eslint-disable-line prefer-destructuring

          needsMoreDelay && (delay += stepDelay) && this.info(`Don't have right content for ${searchNumber}. Trying to download page again with ${delay} delaying`);

        }

        delete parseResult.result.needsMoreDelay;

        if (parseResult.result === false){
          //throw new Error('stop1');
          //console.log('wrong number');
          continue;
        }

        return parseResult.result && (parseResult.result.billOfLadingNumber || parseResult.result.billOfLadingNumber ||
        parseResult.result.containers && parseResult.result.containers.length) ? parseResult.result : {};

      }
      this.error(`Needs searching number for ${this.lineName}`);

      return parseResult;
    }

    return {};
  }
}

module.exports = LineCosco;

/* eslint-disable */
function getData(){


  var grabber = function() {

    try{
      var result = {
          containers: [],
          shipmentNumber: null,
          billOfLadingNumber: null,
          needsMoreDelay: false
      };

      var noResult;
      var path;
      var pathEl;
      var trackingType = '';
      var billOfLadingNumber = '';
      var shipmentNumber = '';
      var containers = [];
      var container = {};
      var containerElArr = [];
      var containerEl = '';
      var currentState = [];
      var ETA = '';
      var location = {};
      var lastLocation = {};
      var locationsEls;
      var locationEl;
      var state = [];
      var stateState = [];
      var stateStateVal = '';
      var finalState = {};
      var date = '';
      var period = '';
      var voyage = '';



      // Wrong number 1
      path = '.noFoundTips';
      pathEl = document.querySelectorAll(path);

      if(pathEl && pathEl.length){
        return false;
      }

      // Wrong number 2
      path = '.ivu-form-item-error-tip';
      pathEl = document.querySelectorAll(path);

      if(pathEl && pathEl.length){
        return false;
      }

      // Page isn't loaded
      path = '.ivu-c-detailPart';
      pathEl = document.querySelectorAll(path);
      if(!pathEl || !pathEl.length){
        result.needsMoreDelay = true;
      }


      path = '.ivu-select-selection > span.ivu-select-selected-value';
      pathEl = document.querySelectorAll(path);

      if(pathEl && pathEl.length){
        trackingType = pathEl[0].innerHTML.trim();
      }else{
        throw new Error('No trackingType!');
      }


      if(trackingType=='Bill Of Lading' || trackingType=='Booking'){
        trackingType = 1;
      }else{
        trackingType = 2; //'Container'
      }

      switch(trackingType) {
        case 1:

          // Bill of Lading number
          path = '.ivu-c-detailPart .content > p';
          billOfLadingNumber = document.querySelectorAll(path)[1].innerHTML.trim();
          billOfLadingNumber = billOfLadingNumber.match(/(\d*?)\s/m)[1];
          result.billOfLadingNumber = billOfLadingNumber;

          // Shipment number
          path = '.ivu-c-detailPart .content > p';
          shipmentNumber = document.querySelectorAll(path)[0].innerHTML.trim();
          shipmentNumber = shipmentNumber.match(/(\d*?)\s/m)[1];
          result.shipmentNumber = shipmentNumber;

          // Containers
          path = '.cntrsList .ivu-table-row';
          containerElArr = document.querySelectorAll(path);

          for (var i = 0; i < containerElArr.length; i++) {
            containerEl = containerElArr[i];

            // Containers > Container
            container = {};

            // Containers > Container > Number
            path = 'div > p > span.content';
            container.number = containerEl.querySelectorAll(path)[0].innerHTML.trim();

            // Containers > Container > Type
            path = 'div > p > span.content';
            container.type = containerEl.querySelectorAll(path)[1].innerHTML.trim();

            // Containers > Container > ETA {}
            path = '.ivu-c-detailPart .content > p';
            pathEl = document.querySelectorAll(path);

            ETA = pathEl[7].innerHTML.trim();
            ETA = ETA.match(/(\d{4}\-\d{2}\-\d{2})\s/m)[1];
            ETA = ETA.split('-');
            ETA = new Date(ETA[0], ETA[1] - 1, ETA[2]).toDateString();
            ETA = ETA.split(' ');
            ETA = ETA[2]+' '+ETA[1]+' '+ETA[3];

            container.eta = {
              'date': ETA
            }

            // Containers > Container > Locations []
            container.locations = [];

            // Containers > Container > Locations > Location
            location = {};

            // Containers > Container > Locations > Location > Location
            path = 'td > div > span';
            location.location = containerEl.querySelectorAll(path)[0].innerHTML.trim();

            // Containers > Container > Locations > Location > States []
            location.states = [];

            // Containers > Container > Locations > Location > States > State {}
            state = {};

            // Containers > Container > Locations > Location > States > State > Date
            path = 'td:nth-child(2) > div > div > p:nth-child(2) > span.content';
            date = containerEl.querySelectorAll(path)[0].innerHTML.trim();
            date = date.split(' ');
            date = date[0];
            date = date.split('-');
            date = new Date(date[0], date[1] - 1, date[2]).toDateString();
            date = date.split(' ');
            date = date[2]+' '+date[1]+' '+date[3];
            state.date = date;

             // Containers > Container > Locations > Location > States > State > Period
            period = 'current';
            state.period = period;

            // Containers > Container > Locations > Location > States > State > State []
            path = 'td:nth-child(2) > div > div > p:nth-child(1) > span.content';
            stateStateVal = containerEl.querySelectorAll(path)[0].innerHTML.trim();
            stateState = [stateStateVal, ''];
            state.state = stateState;

            // Containers > Container > Locations > Location > States >  State > Voyage
            /*
            path = '.ivu-c-detailPart > .ivu-row:nth-child(4) > div.content > p';
            voyage = document.querySelectorAll(path)[0].innerHTML.trim();
            voyage = voyage.match(/(.*?)\n/m)[1];
            */
            state.voyage = '';

            // Containers > Container > Locations > Location > States >  State (final)
            finalState = {};

            finalState.date   = ETA;
            finalState.period = 'future';
            finalState.state  = ['Discharged in POD', ''];
            finalState.voyage = '';


            // Containers > Container > currentState
            currentState = [
              stateStateVal,
              state.date,
              location.location
            ];
            container.currentState = currentState;

            location.states.push(state);
            location.states.push(finalState);
            container.locations.push(location);
            result.containers.push(container);

          }

          break;
        case 2:
          // Containers > Container
          container = {}

          // Containers > Container > Number
          path = '.cntrNumber';
          container.number = document.querySelectorAll(path)[0].innerHTML.trim();


          // Containers > Container > Type
          path = '.cntrInfos > span:nth-child(1) > span';
          container.type = document.querySelectorAll(path)[0].innerHTML.trim();

          // Containers > Container > ETA {}
          path = '.ETA > .date';
          ETA = document.querySelectorAll(path)[0].innerHTML.trim();
          ETA = ETA.split(' ');
          ETA = ETA[0];
          ETA = ETA.split('-');
          ETA = new Date(ETA[0], ETA[1] - 1, ETA[2]).toDateString();
          ETA = ETA.split(' ');
          ETA = ETA[2]+' '+ETA[1]+' '+ETA[3];

          container.eta = {
            'date': ETA
          }

          // Containers > Container > Locations []
          container.locations = [];

          path = '.cntrMovintItem';
          locationsEls = document.querySelectorAll(path);

          for (var i = 0; i < locationsEls.length; i++) {
            locationsEl = locationsEls[i];

            // Containers > Container > Locations > Location
            location = {};

            // Containers > Container > Locations > Location > Location
            path = 'div.ivu-col-span-10 > p.value';
            location.location = locationsEl.querySelectorAll(path)[0].innerHTML.trim();

            // Containers > Container > Locations > Location > States []
            location.states = [];

            // Containers > Container > Locations > Location > States > State {}
            state = {};

            // Containers > Container > Locations > Location > States > State > Date
            path = 'div.ivu-col-span-3 > p.data';
            date = locationsEl.querySelectorAll(path)[0];

            if(date==undefined){
              path = 'div.ivu-col-span-3 > p.date';
              date = locationsEl.querySelectorAll(path)[0];
            }

            date =  date.innerHTML.trim();
            date = date.split(' ');
            date = date[0];
            date = date.split('-');
            date = new Date(date[0], date[1] - 1, date[2]).toDateString();
            date = date.split(' ');
            date = date[2]+' '+date[1]+' '+date[3];

            state.date = date;

            // Containers > Container > Locations > Location > States > State > Period
            if (new Date(date) < new Date()) {
              period = 'past';
            } else {
              period = 'future';
            }

            if(locationsEl.classList.contains('cntrCurrentMoving')){
              period = 'current';
            }

            state.period = period;

            // Containers > Container > Locations > Location > States > State > Voyage
            state.voyage = null;

            // Containers > Container > Locations > Location > States > State > State
            path ='div.ivu-col-span-8 > p.value';
            state.state = locationsEl.querySelectorAll(path)[0].innerHTML.trim();

            // Containers > Container > currentState
            if(locationsEl.classList.contains('cntrCurrentMoving')){
              currentState = [
                state.state,
                state.date,
                location.location
              ];

              container.currentState = currentState;
            }

            if (container.locations.length == 0) {
              container.locations.push({
                'location': location.location,
                'states': []
              });
            }

            if (container.locations.length == 1) {
              lastLocation = container.locations[0];
            } else {
              lastLocation = container.locations[container.locations.length - 1];
            }

            if (lastLocation.location == location.location) {
              // push state
              lastLocation.states.push(state);
            } else {
              // push location
              container.locations.push({
                'location': location.location,
                'states': [state]
              });
            }

          }

          result.containers.push(container);

          break;
        default:
          //
      }

      return result;

    } catch (e) {
      //console.error(e.message);
      return {
        error: e.message
      };
    }
  }

  return grabber();

}

/* eslint-enable */

