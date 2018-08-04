'use strict';

const ILine = require('./iline');
//const util  = require('util');

class LineMsc extends ILine {
  constructor() {
    super();

    this.lineName = 'MSC';
    this.url = 'https://www.msc.com/track-a-shipment?agencyPath=ukr';
  }

  async search(searchNumber) {

    const maxDelay = 10000,
      stepDelay = 1000,
      request = `function sendRequest(){

        var path, input_el, button_el, result = {};

        result.number = '${searchNumber.trim()}';

        path = 'div.search-input input';
        input_el = document.querySelectorAll(path)[0];
        input_el.value = '${searchNumber.trim()}';

        path = 'div.search-button > a';
        button_el = document.querySelectorAll(path)[0];
        button_el.click();

        result.kolvo = document.querySelectorAll(path).length;

        return result;
      }`;

    let parseResult = {},
      delay = 1000,
      needsMoreDelay = true;

    if (searchNumber.trim()) {

      parseResult = await this.parse(this.url, request, false, delay);

      //console.log(parseResult.result);

      delay = 2000; // eslint-disable-line no-magic-numbers

      while (needsMoreDelay && delay < maxDelay) {
        // test searching number for Bill of Lading, Booking or container
        parseResult = await this.parse(parseResult.page, getData, false, delay);

        needsMoreDelay = parseResult.result.needsMoreDelay; // eslint-disable-line prefer-destructuring

        needsMoreDelay && (delay += stepDelay) && this.info(`Don't have right content for ${searchNumber}. Trying to download page again with ${delay} delaying`);
      }
      //console.log(parseResult.result);
      //
      //return parseResult;

      delete parseResult.result.needsMoreDelay;

      //console.log(util.inspect(parseResult.result, false, null));
      return parseResult.result && (parseResult.result.billOfLadingNumber || parseResult.result.billOfLadingNumber ||
      parseResult.result.containers && parseResult.result.containers.length) ? parseResult.result : {};

    }
    this.error(`Needs searching number for ${this.lineName}`);

    //console.log(util.inspect(parseResult.result, false, null));
    return parseResult;
  }
}

module.exports = LineMsc;

/* eslint-disable */

function getData(){

  var cleanStr = function (str) {

    //'&nbps; etc
    str = str.replace(/&[a-z]{2,7};/gmi, '');

    // &#402; etc
    str = str.replace(/&#\d{3,4};/gm, '');

    str = str.trim();

    return str;
  }

  var grabber = function() {
    try {
      var result = {
          containers: [],
          shipmentNumber: null,
          billOfLadingNumber: null,
          needsMoreDelay: false
        };

      var path = "dl.containerAccordion > dd";
      var elements = document.querySelectorAll(path);
      var billOfLading = null;
      var shipmentNumber = null;
      var pathEl;
      var noResult;
      var searchNumber;

      // No result
      path = '.columns > .copyPanel > h3';
      pathEl = document.querySelectorAll(path);

      if(pathEl && pathEl.length){
        noResult = pathEl[0].innerHTML;
        if(noResult.indexOf('No matching tracking information') !== -1){
          return result;
        }
      }

      // Page isn't loaded
      if(elements.length == 0){
        result.needsMoreDelay = true;
      }

      // Bill of Lading
      path = '.copyPanel > dl > dd > a';
      pathEl = document.querySelectorAll(path);

      if(pathEl && pathEl.length){
        billOfLading = pathEl[0].innerHTML;

        if(billOfLading.indexOf('Bill of lading') !== -1){
          billOfLading = billOfLading.match(/:(.*?)\(/);
          billOfLading = billOfLading[1].trim();
        }else{
          billOfLading = null;
        }

      }

      result.billOfLadingNumber = billOfLading;

      // Shipment number
      path = '.columns > .copyPanel > h3';
      pathEl = document.querySelectorAll(path);

      if(pathEl && pathEl.length){
        shipmentNumber = pathEl[0].innerHTML;

        if(shipmentNumber.indexOf('Booking Number') !== -1){
          shipmentNumber = shipmentNumber.match(/:(.*?)\(/);
          shipmentNumber = shipmentNumber[1].trim();
        }else{
          shipmentNumber = null;
        }

      }
      result.shipmentNumber = shipmentNumber;

      // Case 2
      path = '.search-item .search-input > div input';
      pathEl = document.querySelectorAll(path);

      if(pathEl && pathEl.length){
        searchNumber = pathEl[0].value.trim();

        if(elements.length > 1 && billOfLading==null){
          result.shipmentNumber = searchNumber;
        }
      }

      // Case 3
      path = '.search-item .search-input > div input';
      pathEl = document.querySelectorAll(path);
      if(pathEl && pathEl.length){
        searchNumber = pathEl[0].value.trim();

        if(searchNumber==billOfLading){
          result.billOfLadingNumber = '';
        }
      }


      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var container = {};
        var currentState = '';
        var rows = '';

        // number
        pathEl = el.querySelectorAll('a');
        if(pathEl && pathEl.length){
          container.number = el.querySelectorAll('a')[0].innerHTML;
          container.number = container.number.replace('Container:', '').trim();
        }else{
          container.number = '';
        }


        // type
        pathEl = el.querySelectorAll('td[data-title="Type"] > span');
        if(pathEl && pathEl.length){
          container.type = pathEl[0].innerHTML;
          container.type = container.type.replace('\n', '').trim();
        }else{
          container.type = '';
        }


        // ETA
        container.eta = {
          'date': ''
        }

        // get locations
        container.locations = [];

        rows = el.querySelectorAll('.resultTable > tbody > tr');

        for (var k = 0; k < rows.length; k++) {
          var row = rows[k];
          var current_location = row.querySelectorAll('td[data-title="Location"] > span')[0].innerHTML;

          var state = [],   // Description
            voyage = '',  // Voyage
            period = '',  // future or past
            date = '';    // Date

          var state_val = '';
          var vessel = '';
          var date_converted = '';
          var date_arr  = [];
          var state_obj = {};
          var last_location = '';
          var location_el = '';
          var background = '';

          current_location = cleanStr(current_location);

          if (container.locations.length == 0) {
            container.locations.push({
              'location': current_location,
              'states': []
            });
          }

          // state
          pathEl = row.querySelectorAll('td[data-title="Description"] > span');
          if(pathEl && pathEl.length){
            state_val = cleanStr(pathEl[0].innerHTML);
            state = [state_val];

          }else{
            state = [''];
          }

          //vessel
          pathEl = row.querySelectorAll('td[data-title="Vessel"] > span');
          if(pathEl && pathEl.length){
            vessel = cleanStr(pathEl[0].innerHTML);
            state.push(vessel);
          }


          // voyage
          pathEl = row.querySelectorAll('td[data-title="Voyage"] > span');
          if(pathEl && pathEl.length){
            voyage = cleanStr(pathEl[0].innerHTML);
          }else{
            voyage = '';
          }

          //throw new Er

          // date
          pathEl = row.querySelectorAll('td[data-title="Date"] > span');
          if(pathEl && pathEl.length){
            date = pathEl[0].innerHTML.trim();
            date_arr = date.split("/");
            date_converted = new Date(date_arr[2], date_arr[1] - 1, date_arr[0]).toDateString();
            date_converted = date_converted.split(' ');
            date_converted = date_converted[2]+ ' ' + date_converted[1] + ' ' + date_converted[3];
          }else{
            date_converted = '';
          }


          // ETA
          if(state_val=="Estimated Time of Arrival"){
            container.eta = {
              'date' : date_converted
            };
          }

          // period
          if(date_arr){
            if (new Date(date_arr[2], date_arr[1] - 1, date_arr[0]) < new Date()) {
              period = 'past';
            } else {
              period = 'future';
            }
          }else{
            period = '';
          }


          if (container.locations.length == 1) {
            last_location = container.locations[0];
          } else {
            last_location = container.locations[container.locations.length - 1];
          }

          var last_period = last_location.states[last_location.states.length-1];

          if(last_period!=undefined){
            last_period = last_period.period;

            if(last_period == 'future' && period == 'past'){
              period = 'current';
            }
          }

          if(last_period==undefined && period == 'past'){
            period = 'current';
          }

          /*
          location_el = row.querySelectorAll('td[data-title="Location"]')[0];
          background = window.getComputedStyle(location_el).backgroundImage.trim();

          if(background!='none'){
            period = 'current';
          }
          */

          state_obj = {
            'state'  : state,
            'voyage' : voyage,
            'date'   : date_converted,
            'period' : period
          }

          // current state
          if(k == 0){
            container.currentState = [
              state_val,
              date_converted,
              current_location
            ];
          }


          if (last_location.location == current_location) {
            // push state
            last_location.states.push(state_obj);
          } else {
            // push location
            container.locations.push({
              location: current_location,
              states: [state_obj]
            });
          }
        }

        result.containers.push(container);
        //console.log(container);
        //throw new Error('stop');
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

