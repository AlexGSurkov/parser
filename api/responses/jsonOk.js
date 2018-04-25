module.exports = function (data, options = {}) { //no arrow function here!!!

  const {req, res} = this,
    sails = req._sails,
    status = options.status || 'ok';

  sails.log.silly('res.jsonOk() :: Sending 200 ("OK") response');
  sails.log.silly('data: ', data);

  // Set status code
  res.status(200); // eslint-disable-line no-magic-numbers

  return res.json({status, data});
};
