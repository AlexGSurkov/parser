'use strict';

// api depends module

const ILine = require('./iline'),
  request = require('request-promise'),
  Promise = require('bluebird'),
  _ = require('lodash');

class LineCoscoApi extends ILine {
  constructor() {
    super();

    this.lineName = 'COSCO';
    this.blUrl = 'http://elines.coscoshipping.com/ebtracking/public/bill/';
    this.blAndCnt = 'http://elines.coscoshipping.com/ebtracking/public/bill/containers/';
    this.bgUrl = 'http://elines.coscoshipping.com/ebtracking/public/booking/';
    this.cntUrl = 'http://elines.coscoshipping.com/ebtracking/public/containers/';
    this.cntAndBillUrl = 'http://elines.coscoshipping.com/ebtracking/public/container/status/';
    this.vessel = 'http://elines.coscoshipping.com/ebtracking/public/container/vessel/';
  }

  getBlUrl(searchNumber) {
    return `${this.blUrl}${searchNumber}`;
  }

  getBlCntUrl(billNumber) {
    return `${this.blAndCnt}${billNumber}`;
  }

  getBgUrl(searchNumber) {
    return `${this.bgUrl}${searchNumber}`;
  }

  getContUrl(searchNumber) {
    return `${this.cntUrl}${searchNumber}`;
  }

  getCntAndBillUrl(billNumber, contNumber) {
    return `${this.cntAndBillUrl}${contNumber}?billNumber=${billNumber}`;
  }

  getVessel(contNumber, containerNumberStatus, timeOfIssue) {
    return `${this.vessel}${contNumber}?containerStatus=${containerNumberStatus}&issueTimeStr=${timeOfIssue}`;
  }

  async parseContainerStatus(history, shipments = {}) {
    let locations = {},
      currentState = [];

    history = history.reverse();

    // define current period
    history.forEach((state, idx) => {
      state.period = new Date(state.timeOfIssue) < new Date() ? 'past' : 'future';
      state.period === 'future' && idx > 0 && history[idx].period === 'past' && (history[idx].period = 'current');
      // all states is past period
      state.period === 'past' && idx === history.length - 1 && (state.period = 'current');
    });

    // group states by location
    await asyncForEach(history, async ({location, containerNumber, containerNumberStatus, timeOfIssue, transportation, period}) => {
      let vessel = [],
        voyage = '';

      !locations[location] && (locations[location] = []);

      // add vessel & voyage  to locations from actualShipment || query to cosco
      if (transportation === 'Vessel') {
        const pod = location.split(',')[1];

        if (Object.keys(shipments).length) {
          shipments[pod] && (vessel = [shipments[pod].vesselName]) && (voyage = shipments[pod].voyageNo);
        } else {
          const vesselResponse = await request.get({
            uri: this.getVessel(containerNumber, containerNumberStatus, timeOfIssue),
            json: true
          }).then(response => {
            const content = _.get(response, 'data.content', null);

            if (response.code === '200' && content) {
              return {
                voyage: _.get(content, 'voyNum', ''),
                vessel: _.get(content, 'vslNme', null)
              };
            }
            this.info(`Fetching vessel for container ${containerNumberStatus} code: ${response.code} error: ${response.message}`);

            return {voyage: '', vessel: null};
          }).catch(error => {
            this.error(`Fetching vessel is failed for container ${containerNumberStatus} error: ${error}`);

            return {voyage: '', vessel: null};
          });

          vessel = [vesselResponse.vessel];
          voyage = vesselResponse.voyage; // eslint-disable-line prefer-destructuring
        }
      }

      period === 'current' && (currentState = [containerNumberStatus, timeOfIssue, location]);

      locations[location].push({
        date: timeOfIssue,
        period,
        state: [containerNumberStatus, ...vessel],
        voyage
      });
    });

    return {
      locations: Object.keys(locations).map(location => ({
        location,
        states: locations[location]
      })),
      currentState
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
            uri: this.getBlUrl(searchNumber),
            json: true
          }),
          content = _.get(response, 'data.content', null);

        //console.log(response);
        if (response.code === '200' && content) {
          const actualShipment = _.get(content, 'actualShipment', null);

          result.billOfLadingNumber = _.get(content, 'trackingPath.billOfladingRefCode', '');
          result.shipmentNumber = _.get(content, 'trackingPath.trackingGroupReferenceCode', '');

          // there is BL or Booking
          if (result.billOfLadingNumber || result.shipmentNumber) {
            let eta = {
              date: _.get(content, 'trackingPath.cgoAvailTm', null),
              pod: _.get(content, 'trackingPath.pod', null)
            };

            // define ETA
            eta.pod && (eta.pod = eta.pod.replace(' -', ','));

            // get containers
            const containers = _.get(content, 'cargoTrackingContainer', null);

            if (containers && containers.length) {
              let shipments = {};

              result.containers = containers.map(({cntrNum}) => ({
                number: cntrNum,
                eta
              }));

              if (actualShipment && actualShipment.length) {
                // convert actualShipment to object with keys as portOfLoading
                actualShipment.forEach(ship => shipments[ship.portOfLoading] = ship);
              }

              // define types of containers (and other data if needs)
              const containersData = await request.get({
                uri: this.getBlCntUrl(result.billOfLadingNumber),
                json: true
              }).then(({code, data}) => {
                let cntsData = {};

                if (code === '200') {
                  const dataContent = _.get(data, 'content', null);

                  if (dataContent && dataContent.length) {
                    dataContent.forEach(({containerNumber, containerType}) => cntsData[containerNumber] = {
                      type: containerType
                    });
                  } else {
                    this.info(`There isn't containers data content for Bill of Lading: ${result.billOfLadingNumber}`);
                  }
                } else {
                  this.info(`Fetching containers data is failed for Bill of Lading: ${result.billOfLadingNumber}`);
                }

                return cntsData;
              });

              result.containers.forEach(container => containersData[container.number] && (container.type = containersData[container.number].type));

              // define locations
              const containersHistory = await Promise.map(result.containers, ({number}) => request.get({
                uri: this.getCntAndBillUrl(result.billOfLadingNumber, number),
                json: true
              }).then(({code, data}) => {
                if (code === '200') {
                  const dataContent = _.get(data, 'content', null);

                  if (dataContent) {
                    return this.parseContainerStatus(dataContent, shipments);
                  }

                  this.info(`There isn't container history content for Bill of Lading: ${result.billOfLadingNumber}`);
                } else {
                  this.info(`Fetching locations is failed for Bill of Lading: ${result.billOfLadingNumber}`);
                }

                return {};
              }).catch(error => {
                this.error(`Fetching containers for Bill of Lading: ${result.billOfLadingNumber} error: ${error.message}`);
                //console.log(error);
              }), {concurrency: 2}); // eslint-disable-line no-magic-numbers

              containersHistory.forEach((history, idx) => Object.assign(result.containers[idx], history));
            }
          } else { // check if searching number is container
            response = await request.get({
              uri: this.getContUrl(searchNumber),
              json: true
            });

            content = _.get(response, 'data.content', null);

            if (response.code === '200' && content && !_.get(content, 'notFound', null)) {
              const containerCircleStatus = _.get(content, 'containers[0].containerCircleStatus', null);

              let container = {
                number: _.get(content, 'containers[0].container.containerNumber', null),
                type: _.get(content, 'containers[0].container.containerType', null)
              };

              if (containerCircleStatus && containerCircleStatus.length) {
                const history = await this.parseContainerStatus(containerCircleStatus);

                Object.assign(container, history);
              } else {
                this.info(`There isn't container history content for ${searchNumber}`);
              }

              result.containers = [container];
            }
          }
        }
        //return result;
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

module.exports = LineCoscoApi;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
