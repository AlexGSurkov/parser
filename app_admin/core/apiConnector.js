'use strict';

import Constants from 'core/constants';
import CoreActions from 'core/actions';

/**
 *
 * Module for remote connect
 * this is the same module as in GAS/ATM
 *
 */

// eslint-disable-next-line no-extra-parens, no-var
const remote = (function() {
  /**
   * Connects to remote server using url and options, returns raw response
   *
   * @param {string}  url
   * @param {object}  options
   * @returns {Promise}
   */
  this.connectRaw = (url, options = {}) => {
    return fetch(url, options).then(response => {
      if (response.ok) {
        return response;
      }
      throw new Error(`${response.statusText} (${response.status})`);
    });
  };

  /**
   * Connects to remote server using url and options, returns response as JSON format
   *
   * @param {string}  url
   * @param {object}  options
   * @returns {Promise}
   */
  this.connect = (url, options = {}) => {
    return this.connectRaw(url, options).then(response => response.json());
  };

  return this;

}).call(remote || {});


export default {
  GET(url, token) {
    return this.connect('GET', url, token);
  },

  POST(url, token, body) {
    return this.connect('POST', url, token, body);
  },

  PUT(url, token, body) {
    return this.connect('PUT', url, token, body);
  },

  DELETE(url, token) {
    return this.connect('DELETE', url, token);
  },

  connect(type, url, token, body = null) {
    let options = {
      method: type,
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    CoreActions.LoaderActions.setShow(true);

    // don't show error message in catch block here, all error handling should be at top level
    return remote.connect(Constants.apiURL + url, options).then(response => {
      CoreActions.LoaderActions.setShow(false);
      return response;
    }).catch(e => {
      CoreActions.LoaderActions.setShow(false);
      throw e;
    });
  }
};
