'use strict';

module.exports = {
  async create(req, res) {
    try {
      const authData = await JWTService.getPayloadData(req);

      res.jsonOk();

      authData.role !== 'admin' && res.jsonBad(`Auth token is invalid!`);

      const {login, role, firstName, lastName, email, phone, address, password} = req.body;

      //todo
      //check user fields

      let createdFields = {login, firstName, lastName, email, phone, address, role};

      if (password) {
        createdFields.password = UserService.getUserPasswordHash(password);
      }

      const {id} = await User.create(createdFields);

      res.jsonOk({id});
    } catch (e) {
      res.jsonBad(e.message);
    }
  }

};
