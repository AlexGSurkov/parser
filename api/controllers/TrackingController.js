'use strict';

module.exports = {
  async find(req, res) {
    try {
      await UtilsService.checkAuthorisation(req);

      const name = req.param('name'),
        line = req.param('line'),
        // get vessel data by name & line
        {imo} = await TrackingService.findVesselByName(name, line);

      const currentLocation = await TrackingService.getCurrentLocation(imo);

      // todo: if unknown currentLocation we can get last known location from database

      res.jsonOk(currentLocation);
    } catch (e) {
      res.jsonBad(e.message);
    }
  },

  async addVessels(req, res) {
    try {
      const {role} = await UtilsService.checkAuthorisation(req);

      if (role !== 'admin') {
        throw new Error('Only user with role "admin" can update DB of vessels');
      }

      if (req.body && Array.isArray(req.body)) {
        const result = await TrackingService.addVessels(req.body);

        result.error ? res.jsonBad(result.error) : res.jsonOk();
      } else {
        res.jsonBad(`Needs body with array of vessel's IMO`);
      }
    } catch (e) {
      res.jsonBad(e.message);
    }
  }

};
