/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */
const util = require('util');

let requestCounter = 0,
  requestQueue = {};

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Express middleware to use for every Sails request. To add custom          *
  * middleware to the mix, add a function to the middleware config object and *
  * add its key to the "order" array. The $custom key is reserved for         *
  * backwards-compatibility with Sails v0.9.x apps that use the               *
  * `customMiddleware` config option.                                         *
  *                                                                           *
  ****************************************************************************/

  middleware: {

  /***************************************************************************
  *                                                                          *
  * The order in which middleware should be run for HTTP request. (the Sails *
  * router is invoked by the "router" middleware below.)                     *
  *                                                                          *
  ***************************************************************************/

    order: [
      // 'startRequestTimer',
      'cookieParser',
      'session',
      'gzRequestLogger',
      'bodyParser',
      'handleBodyParserError',
      'compress',
      // 'methodOverride',
      // 'poweredBy',
      // '$custom',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ],

  /****************************************************************************
  *                                                                           *
  * Logs each reques.                                                         *
  *                                                                           *
  ****************************************************************************/

    gzRequestLogger(req, res, next) {
      let reqId = ++requestCounter;

      requestQueue[reqId] = process.hrtime();
      req._id = reqId;
      sails.log.info(`Start req ${process.pid}:${reqId}, ${req.method}:${req.url}, queue:${Object.keys(requestQueue).length}`);

      let finHandle = name => {
        let hrstart = requestQueue[reqId], execTime = 0;

        if (hrstart) {
          let hrend = process.hrtime(hrstart);

          execTime = `${hrend[0]}.${Math.round(hrend[1]/1000000)}s`;
        }

        sails.log.info(`${name} response: ${process.pid}:${reqId}, ${req.method}:${req.url}, ${execTime}, queue:${Object.keys(requestQueue).length}`);
        delete requestQueue[reqId];
      };

      res.on('finish', () => {
        finHandle('Finish');
      });

      res.on('end', () => {
        finHandle('End');
      });

      return next();
    },

    /**
     * Body parser error handler
     *
     * @param   {object}     err
     * @param   {object}     req
     * @param   {object}     res
     * @param   {function}   next
     */
    handleBodyParserError(err, req, res, next) {  // eslint-disable-line no-unused-vars
      if (req.path && /\/api\/resources/.test(req.path)) {
        // api formed error
        res.json(200,{
          success: false,
          errors: ['Can\'t parse JSON request'],
        });

        return;
      }

      // usual error
      let bodyParserFailureErrorMsg = 'Unable to parse HTTP body - error occurred :: ' +
        util.inspect(err && err.stack ? err.stack : err, false, null);

      sails.log.error(bodyParserFailureErrorMsg);
      res.send(400, bodyParserFailureErrorMsg);
    },

  },

  /***************************************************************************
  *                                                                          *
  * The body parser that will handle incoming multipart HTTP requests. By    *
  * default as of v0.10, Sails uses                                          *
  * [skipper](http://github.com/balderdashy/skipper). See                    *
  * http://www.senchalabs.org/connect/multipart.html for other options.      *
  *                                                                          *
  ***************************************************************************/

  // bodyParser: require('skipper')

  /***************************************************************************
  *                                                                          *
  * The number of seconds to cache flat files on disk being served by        *
  * Express static middleware (by default, these files are in `.tmp/public`) *
  *                                                                          *
  * The HTTP static cache is only active in a 'production' environment,      *
  * since that's the only time Express will cache flat-files.                *
  *                                                                          *
  ***************************************************************************/

  // cache: 31557600000

};
