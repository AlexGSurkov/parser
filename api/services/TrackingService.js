'use strict';

const Promise = require('bluebird');
  //_ = require('lodash');

const VESSEL_CONCURANCY = 10;

module.exports = {

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
   *
   * One user
   *
   */

  /**
   * Find one item by filter
   *
   * @param   {object}    filter
   * @returns {Promise}
   */
  findItemByFilter(filter = {}) {
    return User.findOne(filter).then(item => {
      if (!item) {
        throw new Error('User not found by filter');
      }
      return item;
    });
  }

};
