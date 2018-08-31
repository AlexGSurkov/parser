'use strict';

const Promise = require('bluebird'),
  request = require('request-promise');
  //_ = require('lodash');

const VESSEL_CONCURANCY = 10;

module.exports = {

  /**
   * Upsert vessel's imo needs for tracking
   *
   * @param   {string[][]}    vessels
   * @returns {object}
   */

  async addVessels(vessels) {
    try {
      const imo = vessels.map(([imo]) => imo),
        existImos = await Vessel.findAll({where: {imo}, raw: true}).then(result => result ? result.map(({imo}) => imo) : []),
        newVessels = vessels.filter(([imo]) => !existImos.includes(imo)).map(([imo, name, line = '']) => ({imo, name, line})),
        existVessels = vessels.filter(([imo]) => existImos.includes(imo)).map(([imo, name, line = '']) => ({imo, name, line}));

      if (newVessels.length || existVessels.length) {
        await SequelizeConnections[sails.config.models.connection].transaction(async transaction => {
          newVessels.length && await Vessel.bulkCreate(newVessels, {transaction});

          existVessels.length && await Promise.map(existVessels, vessel =>
            Vessel.update(vessel, {where: {imo: vessel.imo}, transaction})
          , {concurrency: VESSEL_CONCURANCY});
        });
      }

      return {};
    } catch (e) {
      console.error(e);

      return {error: e.message};
    }
  },

  /**
   * Find one vessel by filter
   *
   * @param   {object}    filter
   * @returns {Promise}
   */
  findVesselByFilter(filter = {}) {
    Object.assign(filter, {raw: true});

    return Vessel.findAll(filter).then(items => {
      if (!items.length) {
        throw new Error('Vessel not found by filter');
      }

      if (items.length > 1) {
        throw new Error('There is more then 1 vessel by filter');

        //todo
        //log this situation
      }

      return items[0];
    });
  },

  /**
   * Upsert vessel's imo needs for tracking
   *
   * @param   {string}    imo
   * @returns {object}
   */
  getCurrentLocation(imo) {
    const {url, token, timespan = 2880} = sails.config.tracking; // eslint-disable-line no-magic-numbers

    return request.get({
      uri: `${url}/api/exportvessel/v:5/${token}/timespan:${timespan}/protocol:json/imo:${imo}`,
      json: true
    }).then(res => {
      if (!res.length) {
        throw new Error(`Unknown imo or location for last ${timespan} mins`);
      }

      const [mmsi, lat, lon, speed, heading, course, status, timestamp, dsrc] = res[0];

      // todo
      // log current location

      return {mmsi, lat, lon, speed, heading, course, status, timestamp, dsrc};
    });
  }

};
