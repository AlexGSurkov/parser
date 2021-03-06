'use strict';

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */
let routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  '/': '/app',


  //app

  'POST /app/auth': {
    controller: 'AuthController',
    action: 'create'
  },

  '/app*': {
    controller: 'PageController',
    action: 'render'
  },

  // api

  'POST /api/auth': {
    controller: 'AuthController',
    action: 'create'
  },

  'POST /api/user': {
    controller: 'UserController',
    action: 'create'
  },

  'GET /api/user/:id': {
    controller: 'UserController',
    action: 'find'
  },

  'GET /api/user': {
    controller: 'UserController',
    action: 'find'
  },

  'PUT /api/user/:id': {
    controller: 'UserController',
    action: 'update'
  },

  'DELETE /api/user/:id': {
    controller: 'UserController',
    action: 'destroy'
  },

  'GET /api/search/:line/:number': {
    controller: 'ParsingController',
    action: 'find'
  },

  'GET /api/search/lines': {
    controller: 'ParsingController',
    action: 'getLines'
  },

  'GET /api/container/:userId': {
    controller: 'ContainerController',
    action: 'find'
  },

  'POST /api/container': {
    controller: 'ContainerController',
    action: 'create'
  },

  'DELETE /api/container/:userId': {
    controller: 'ContainerController',
    action: 'delete'
  },

  'PUT /api/container': {
    controller: 'ContainerController',
    action: 'update'
  }
};

module.exports.routes = routes;
