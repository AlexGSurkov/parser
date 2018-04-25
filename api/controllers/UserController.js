'use strict';

module.exports = {

  async find(req, res) {
    try {
      const userId = req.param('id'),
        authData = await JWTService.getPayloadData(req);

      userId !== authData.userId && authData.role !== 'admin' && res.jsonBad(`Auth token is invalid!`);

      const user = userId ? await User.findById(userId) : await User.findAll({order: ['role', 'firstName']});

      if (userId) {
        if (user) {
          const {id, login, role, firstName, lastName, email, phone, address} = user;

          res.jsonOk({id, login, role, firstName, lastName, email, phone, address});
        } else {
          res.jsonBad(`User with ID "${userId}" not found`);
        }
      } else {
        res.jsonOk(user ? user.map(u => {
          const {id, login, role, firstName, lastName, email, phone, address} = u;

          return {id, login, role, firstName, lastName, email, phone, address};
        }) : []);
      }

    } catch (e) {
      res.jsonBad(e.message);
    }
  },

  async update(req, res) {
    try {
      const userId = req.param('id'),
        authData = await JWTService.getPayloadData(req);

      !userId && res.jsonBad('User ID required!');

      userId !== authData.userId && authData.role !== 'admin' && res.jsonBad(`Auth token is invalid!`);

      const {login, role, firstName, lastName, email, phone, address, password} = req.body;

      //todo
      //check user fields

      let updatedFields = {login, firstName, lastName, email, phone, address};

      if (authData.role === 'admin') {
        updatedFields.role = role;
      }

      if (password) {
        updatedFields.password = UserService.getUserPasswordHash(password);
      }

      await User.update(updatedFields, {where: {id: userId}});

      res.jsonOk({id: userId});
    } catch (e) {
      res.jsonBad(e.message);
    }
  },

  /**
   * Create user
   *
   * @param   {object}   req
   * @param   {object}   res
   */
  async create(req, res) {
    try {
      const authData = await JWTService.getPayloadData(req);

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
  },

  /**
   * Delete user
   *
   * @param   {object}   req
   * @param   {object}   res
   */
  async destroy(req, res) {
    try {
      const userId = req.param('id'),
        authData = await JWTService.getPayloadData(req);

      !userId && res.jsonBad('User ID required!');

      authData.role !== 'admin' && res.jsonBad(`Auth token is invalid!`);

      userId === authData.userId && res.jsonBad(`You can't delete youself!`);

      await User.destroy({where: {id: userId}});

      res.jsonOk();
    } catch (e) {
      res.jsonBad(e.message);
    }
  }
};
