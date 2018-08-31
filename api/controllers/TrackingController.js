'use strict';

module.exports = {
  async find(req, res) {
    try {
      await UtilsService.checkAuthorisation(req);

      const name = req.param('name'),
        // get vessel data by name for tracking
        {imo} = await TrackingService.findVesselByFilter({where: {name}});

      // todo
      // try to get imo if line is known

      const currentLocation = await TrackingService.getCurrentLocation(imo);

      // todo
      // if unknown currentLocation we can get last known locatiiion from database

      res.jsonOk(currentLocation);
    } catch (e) {
      res.jsonBad(e.message);
    }
  },

  async addVessels(req, res) {
    try {
      await UtilsService.checkAuthorisation(req);

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
