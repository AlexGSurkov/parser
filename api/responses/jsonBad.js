module.exports = function (data, options = {}) { //no arrow function here!!!

  const {req, res} = this,
    sails = req._sails,
    status = options.status || 'error';

  let  error;

  sails.log.verbose('res.jsonBad() :: Sending json bad response:', data);

  if (data instanceof Error) {
    //sails.log.silly(data.stack);
    error = data.message;
  } else {
    error = data;
  }

  // Set status code
  res.status(200); // eslint-disable-line no-magic-numbers

  return res.json({status, errorMsg: error});
};
