'use strict';

const _ = require('lodash');

module.exports = {
  async create(req, res) {
    try {
      if (!req.body.length) {
        res.jsonBad('Needs array of containers!');

        return;
      }

      const {userId} = await JWTService.getPayloadData(req),
        numbers = req.body.map(({number}) => number),
        exists = await Container.findAll({
          where: {
            number: numbers,
            userId
          },
          attribute: ['id', 'number', 'userId']
        });

      let forUpdate = req.body.filter(container => exists.find(({number}) => number === container.number)),
        forCreate = req.body.filter(container => !exists.find(({number}) => number === container.number));

      forUpdate = forUpdate.map(container => ({...container, userId, id: exists.find(({number}) => number === container.number).id}));
      forCreate = forCreate.map(container => ({...container, userId}));

      await SequelizeConnections[sails.config.models.connection].transaction(async transaction => {
        forUpdate.length &&
        await Promise.all(forUpdate.map(container => Container.update(container, {where: {id: container.id}, transaction}))) &&
        // delete locations for updated containers (temporary)
        await Location.destroy({where: {containerId: exists.map(({id}) => id)}, transaction}) && await createLocations(forUpdate, transaction);

        if (forCreate.length) {
          const createdIds = await Container.bulkCreate(forCreate, {transaction, returning: true}).map(({id}) => id);

          forCreate = forCreate.map((container, idx) => ({...container, id: createdIds[idx]}));

          await createLocations(forCreate, transaction);
        }
      });

      res.jsonOk();
    } catch (e) {
      res.jsonBad(e.message);
    }
  },

  async find(req, res) {
    try {
      const {userId, role} = await JWTService.getPayloadData(req),
        requestUserId = req.param('userId');

      if (userId !== requestUserId && role !== 'admin') {
        res.jsonBad(`You can't looking for containers of other user...`);
        return;
      }

      const containers = await Container.findAll({
        where: {
          userId: requestUserId
        },
        include: [{
          model: Location,
          as: 'locations',
          attributes: ['location', 'states']
        }]
      });

      res.jsonOk(containers);
    } catch (e) {
      res.jsonBad(e.message);
    }
  },

  async delete(req, res) {
    try {
      const {userId, role} = await JWTService.getPayloadData(req),
        requestUserId = req.param('userId'),
        ids = JSON.parse(req.param('ids'));

      if (userId !== requestUserId && role !== 'admin') {
        res.jsonBad(`You can't delete containers of other user...`);
        return;
      }

      const id = await Container.findAll({
          where: {
            userId: requestUserId,
            id: ids
          },
          attributes: ['id']
        }).map(({id}) => id);

      if (id && id.length) {
        await Location.destroy({
          where: {containerId: id}
        });

        const affectedRows = await Container.destroy({
          where: {id}
        });

        res.jsonOk(affectedRows);
      }

      res.jsonBad('Nothing to delete!');
    } catch (e) {
      res.jsonBad(e.message);
    }
  },

  async update(req, res) {
    try {
      await JWTService.getPayloadData(req);

      const //{userId, role} = await JWTService.getPayloadData(req),
        ids = JSON.parse(req.param('ids'));

      let containers = await Container.findAll({
        where: {
          id: ids
        },
        attributes: ['id', 'billOfLadingNumber', 'number', 'line']
      }).map(({id, billOfLadingNumber, number, line}) => ({id, billOfLadingNumber, number, line}));

      //parse containers
      containers = await ParsingService.refreshContainers(containers);

      res.jsonOk(containers);
    } catch (e) {
      res.jsonBad(e.message);
    }
  }

};


async function createLocations(containers, transaction) {
  const locations = _.flatten(containers.map(({id, number, locations}) => {
    locations = locations.map(location => {
      Object.assign(location, {number, containerId: id});

      return location;
    });

    return locations;
  }));

  return Location.bulkCreate(locations, {transaction});
}
