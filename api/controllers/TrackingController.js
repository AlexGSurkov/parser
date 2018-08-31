'use strict';

module.exports = {

  async addVessels(req, res) {
    try {
      await JWTService.getPayloadData(req);

      if (req.body && Array.isArray(req.body)) {
        const result = await TrackingService.addVessels(req.body);

        result.error ? res.jsonBad(result.error) : res.jsonOk();
      } else {
        res.jsonBad(`Needs body with array of vessel's IMO`);
      }

      //TrackingServiice


      //userId !== authData.userId && authData.role !== 'admin' && res.jsonBad(`Auth token is invalid!`);
      //
      //const user = userId ? await User.findById(userId) : await User.findAll({order: ['role', 'firstName']});
      //
      //if (userId) {
      //  if (user) {
      //    const {id, login, role, firstName, lastName, email, phone, address} = user;
      //
      //    res.jsonOk({id, login, role, firstName, lastName, email, phone, address});
      //  } else {
      //    res.jsonBad(`User with ID "${userId}" not found`);
      //  }
      //} else {
      //  res.jsonOk(user ? user.map(u => {
      //    const {id, login, role, firstName, lastName, email, phone, address} = u;
      //
      //    return {id, login, role, firstName, lastName, email, phone, address};
      //  }) : []);
      //}

    } catch (e) {
      res.jsonBad(e.message);
    }
  }

};
