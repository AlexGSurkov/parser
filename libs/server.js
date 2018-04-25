'use strict';

/**
 * Adds global "fetch" method depending on platform (Node.JS/browser)
 */
require('isomorphic-fetch');


/**
 *
 * Module for remote connect
 *
 */

let remote;

remote = function() {
  /**
   * Connects to remote server using url and options, returns raw response
   *
   * @param   {string}  url
   * @param   {object}  options
   * @returns {Promise}
   */
  this.connectRaw = (url, options = {}) => {
    return fetch(url, options).then(response => {  // eslint-disable-line no-undef
      if (response.ok) {
        return response;
      }
      throw new Error(`${response.statusText} (${response.status})`);
    });
  };

  /**
   * Connects to remote server using url and options, returns response as JSON format
   *
   * @param   {string}  url
   * @param   {object}  options
   * @returns {Promise}
   */
  this.connect = (url, options = {}) => {
    return this.connectRaw(url, options).then(response => response.json());
  };

  return this;

}.call(remote || {});


/**
 *
 * Helper module for remote connect with auth token
 *
 */

let server;

server = function() {
  /**
   * Default options for fetch module
   *
   * @param   {object}  options   additional options
   * @returns {object}
   */
  const defaultOptions = (options = {}) => {
    options.method = options.method || 'get';
    options.cache = options.cache || 'no-cache';
    options.redirect = options.redirect || 'error';
    options.headers = options.headers || {};
    options.credentials = options.credentials || 'include';

    return options;
  };

  /**
   * Performs connect to remote server using fetch module and setting auth header using token
   *
   * @param   {string}  url
   * @param   {string}  token
   * @param   {object}  options
   * @returns {Promise}
   */
  const connectWithAuthToken = (url, token, options = {}) => {
    options = defaultOptions(options);
    options.headers.Authorization = `Bearer ${token}`;

    return remote.connect(url, options);
  };


  /**
   *
   * Request methods (public interface)
   *
   */

  /**
   * Sends GET request to server with token in auth header
   *
   * @param   {string}  url
   * @param   {string}  token
   * @returns {Promise}
   */
  this.get = (url, token) => {
    return connectWithAuthToken(url, token);
  };

  /**
   * Sends POST request to server with token in auth header
   *
   * @param   {string}  url
   * @param   {string}  token
   * @param   {object}  body
   * @returns {Promise}
   */
  this.post = (url, token, body = {}) => {
    return connectWithAuthToken(url, token, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  };

  /**
   * Sends PUT request to server with token in auth header
   *
   * @param   {string}  url
   * @param   {string}  token
   * @param   {object}  body
   * @returns {Promise}
   */
  this.put = (url, token, body = {}) => {
    return connectWithAuthToken(url, token, {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  };

  /**
   * Sends DELETE request to server with token in auth header
   *
   * @param   {string}  url
   * @param   {string}  token
   * @returns {Promise}
   */
  this.delete = (url, token) => {
    return connectWithAuthToken(url, token, {
      method: 'delete',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  };

  return this;

}.call(server || {});

module.exports = server;
