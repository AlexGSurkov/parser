/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */

module.exports = function (data, options) { //no arrow function here!!!

  // Get access to `req`, `res`, & `sails`
  const {req, res} = this,
    sails = req._sails;

  // Set status code
  res.status(403); // eslint-disable-line no-magic-numbers

  // Log error to console
  if (data === undefined) {
    sails.log.verbose('Sending 403 ("Forbidden") response');
  } else {
    sails.log.verbose('Sending 403 ("Forbidden") response: \n',data);
  }

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  if (sails.config.environment === 'production') {
    data = undefined;
  }

  // If the user-agent wants JSON, always respond with JSON
  if (req.wantsJSON) {
    return res.jsonx(data);
  }

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
  return res.view('403', {data}, (err, html) => {

    // If a view error occured, fall back to JSON(P).
    if (err) {
      //
      // Additionally:
      // • If the view was missing, ignore the error but provide a verbose log.
      if (err.code === 'E_VIEW_FAILED') {
        sails.log.verbose('res.forbidden() :: Could not locate view for error page (sending JSON instead).  Details: ',err);
      } else { // Otherwise, if this was a more serious error, log to the console with the details.
        sails.log.warn('res.forbidden() :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
      }

      return res.jsonx(data);
    }

    return res.send(html);
  });

};

