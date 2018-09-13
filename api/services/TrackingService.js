'use strict';

const Promise = require('bluebird'),
  request = require('request-promise');
  //_ = require('lodash');

const VESSEL_CONCURANCY = 10,
  MODULE_NAME = 'TrackingService';

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
        newVessels = vessels.filter(([imo]) => !existImos.includes(imo)).map(([imo, name, line = '']) => ({imo, name: name.toUpperCase(), line})),
        existVessels = vessels.filter(([imo]) => existImos.includes(imo)).map(([imo, name, line]) => {
          if (line || line === '') {
            return {imo, name: name.toUpperCase(), line};
          }

          return {imo, name: name.toUpperCase()};
        });

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
   * Find one vessel by name
   *
   * @param   {string}    name
   * @param   {string}    line
   * @returns {Promise}
   */
  async findVesselByName(name, line) {
    let items = await Vessel.findAll({where: {name: name.toUpperCase()}, raw: true});

    if (!items.length) {
      const errorMessage = `Vessel with name "${name}" not found`;

      UtilsService.logActionError(MODULE_NAME, errorMessage, 'findVesselByName');
      throw new Error(errorMessage);
    }

    if (items.length > 1) {
      line && (items = await Vessel.findAll({where: {name: name.toUpperCase(), line}, raw: true}));

      if (!items.length) {
        const errorMessage = `There is more then 1 vessel with name "${name}". But vessel for line "${line}" not found`;

        UtilsService.logActionError(MODULE_NAME, errorMessage, 'findVesselByName');
        throw new Error(errorMessage);
      }

      if (items.length > 1) {
        const errorMessage = `There is more then 1 vessel with name: ${name}`;

        UtilsService.logActionError(MODULE_NAME, errorMessage, 'findVesselByName');
        throw new Error(errorMessage);
      }
    }

    return items[0];
  },

  /**
   * Upsert vessel's imo needs for tracking
   *
   * @param   {string}    imo
   * @returns {object}
   */
  async getCurrentLocation(imo) {
    if (!imo) {
      throw new Error(`Needs IMO for define vessel location`);
    }

    const {url, token, timespan = 2880, locationActualPeriod = 30} = sails.config.tracking; // eslint-disable-line no-magic-numbers

    let lastKnownLocation = await Tracking.findAll({
      limit: 1,
      where: {imo},
      order: [['createdAt', 'DESC']],
      raw: true
    });

    lastKnownLocation = lastKnownLocation.length ? lastKnownLocation[0] : null;

    if (lastKnownLocation && new Date() - new Date(lastKnownLocation.timestamp) < locationActualPeriod * 60000) { // eslint-disable-line no-magic-numbers
      return lastKnownLocation;
    }

    // todo
    // check for this vessel if we have in db the position less then locationActualPeriod old and get it from there
    // use it if dbLocationPreferable

    const res = await request.get({
      uri: `${url}/api/exportvessel/v:5/${token}/timespan:${timespan}/protocol:json/imo:${imo}`,
      json: true
    });

    if (!res.length) {
      throw new Error(`Unknown imo or location for last ${timespan} mins`);
    }

    // todo: show last location from DB?

    const [mmsi, lat, lon, speed, heading, course, status, timestamp, dsrc] = res[0],
      location = {mmsi, lat, lon, speed, heading, course, status, timestamp: UtilsService.addTimeZone(timestamp), dsrc};

    await Tracking.create({...location, imo});

    return location;
  }

};
