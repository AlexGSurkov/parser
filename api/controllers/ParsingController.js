'use strict';

module.exports = {

  async find(req, res) {
    try {
      const line = req.param('line'),
        searchingNumber = req.param('number');

      //let authData;

      line || res.jsonBad(`Needs carrier!`);
      searchingNumber || res.jsonBad(`Needs searching number!`);

      //check authData without sending error if not authorised
      //try {
      //  authData = await JWTService.getPayloadData(req); // eslint-disable-line no-undef
      //} catch (e) {
      //  console.info(`Query from not authorised user. Searching for ${line} ${searchingNumber}`);
      //}

      const result = await ParsingService.searchNumberByLine(line, searchingNumber); // eslint-disable-line no-undef

      res.jsonOk(result);
    } catch (e) {
      res.jsonBad(e.message);
    }
  },

  async getLines(req, res) {
    try {
      res.jsonOk(ParsingService.getLines()); // eslint-disable-line no-undef
    } catch (e) {
      res.jsonBad(e.message);
    }
  }

};
