'use strict';

// api depends module

const ILine = require('./iline'),
  request = require('request-promise');

class LineMaerskApi extends ILine {
  constructor() {
    super();

    this.lineName = 'MAERSK';
    this.url = 'https://api.maerskline.com/track/';
  }

  getUrl(searchNumber) {
    return `${this.url}${searchNumber}`;
  }

  parseContainerStatus(container) {
    const {container_num, container_size, container_type, locations: container_locations, eta_final_delivery} = container; // eslint-disable-line camelcase

    let currentState = [],
      locations = container_locations.map(({terminal, city, country, events}) => ({
        location: `${terminal}, ${city}, ${country}`,
        states: events.map(({activity, expected_time, actual_time, vessel_name, voyage_num, is_current}) => { // eslint-disable-line camelcase
          const date = actual_time || expected_time, // eslint-disable-line camelcase
            period = is_current ? 'current' : new Date() > date ? 'past' : 'future'; // eslint-disable-line camelcase

          let state = [activity];

          vessel_name && state.push(vessel_name); // eslint-disable-line camelcase

          if (period === 'current') {
            currentState = [activity, date, `${vessel_name ? vessel_name : `${terminal}, ${city}, ${country}`}`]; // eslint-disable-line camelcase
          }

          return {
            date,
            state,
            period,
            voyage: voyage_num // eslint-disable-line camelcase
          };
        })
      }));

    return {
      number: container_num, // eslint-disable-line camelcase
      type: `${container_size} ${container_type}`, // eslint-disable-line camelcase
      currentState,
      locations,
      eta: {
        date: eta_final_delivery
      }
    };

  }

  async search(searchNumber) {
    try {
      let result = {
        containers: [],
        shipmentNumber: '',
        billOfLadingNumber: ''
      };

      if (searchNumber) {
        let response = await request.get({
          uri: this.getUrl(searchNumber),
          json: true
        });

        //console.log(response);
        if (!response.error) {
          !response.isContainerSearch && response.tpdoc_num && (result.billOfLadingNumber = response.tpdoc_num);

          if (response.containers && response.containers.length) {
            result.containers = response.containers.map(container => this.parseContainerStatus(container));
          }

          // define eta.pod
          const {city, state, country} = response.destination;

          result.containers.forEach(container => container.eta.pod = `${city}, ${state ? `${state}, ` : ''}${country}`);
        }
      } else {
        this.error(`Needs searching number for ${this.lineName}`);
      }

      return result && (result.billOfLadingNumber || result.billOfLadingNumber ||
      result.containers && result.containers.length) ? result : {};
    } catch (e) {
      //console.error(e.message);
      return {
        error: e.message
      };
    }
  }
}

module.exports = LineMaerskApi;
