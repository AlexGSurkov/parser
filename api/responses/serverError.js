/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 * return res.serverError(err, 'some/specific/error/view');
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 */

module.exports = function serverError(data, options) { //no arrow function here!!!

  // Get access to `req`, `res`, & `sails`
  const {req, res} = this,
    sails = req._sails,
    OK_STATUS_CODE = 200,
    SERVER_ERROR_STATUS_CODE = 500;

  // Log error to console
  if (data === undefined) {
    sails.log.error(`Sending empty ${SERVER_ERROR_STATUS_CODE} ("Server Error") response`);
  } else {
    sails.log.error(`Sending ${SERVER_ERROR_STATUS_CODE} ("Server Error") response: \n`, data);
  }

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  if (sails.config.environment === 'production') {
    data = undefined;
  }

  // If the user-agent wants JSON, always respond with JSON
  if (req.wantsJSON) {
    res.status(OK_STATUS_CODE);

    return res.jsonx({status: 'error', errorMsg: 'Server error'});
  }

  // Set status code
  res.status(SERVER_ERROR_STATUS_CODE);

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = typeof options === 'string' ? {view: options} : options || {};

  // If a view was provided in options, serve it.
  // Otherwise try to guess an appropriate view, or if that doesn't
  // work, just send JSON.
  if (options.view) {
    return res.view(options.view, {data});
  }

  // If no second argument provided, try to serve the default view,
  // but fall back to sending JSON(P) if any errors occur.
  return res.view(SERVER_ERROR_STATUS_CODE.toString(), {data}, (err, html) => {

    // If a view error occured, fall back to JSON(P).
    if (err) {
      //
      // Additionally:
      // • If the view was missing, ignore the error but provide a verbose log.
      if (err.code === 'E_VIEW_FAILED') {
        sails.log.verbose('res.serverError() :: Could not locate view for error page (sending JSON instead).  Details: ',err);
      // Otherwise, if this was a more serious error, log to the console with the details.
      } else {
        sails.log.warn('res.serverError() :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
      }
      return res.jsonx(data);
    }

    return res.send(html);
  });

};

