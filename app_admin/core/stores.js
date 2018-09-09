'use strict';

import Reflux from 'reflux';
import _ from 'lodash';
import Promise from 'bluebird';
import API from './apiConnector';
import Actions from './actions';
import Constants from './constants';

const {pathPrefix, apiPrefix} = Constants;

let AuthorizationStore = Reflux.createStore({

  /**
   * relative url to auth
   */
  authUrl: (pathPrefix.startsWith('/') ? pathPrefix.slice(1) : pathPrefix) + '/auth',

  init() {
    const authData = localStorage.getItem('AuthData');

    this.listenTo(Actions.ActionsAuth.performAuth, this.signin);
    this.listenTo(Actions.ActionsAuth.logout, this.logout);

    this.resetStore(authData);
  },

  resetStore(authData) {
    console.info('authData', authData ? JSON.parse(authData) : {});
    this.setAuthData(authData ? JSON.parse(authData) : {});
  },

  checkUserSession() {
    return API.GET(this.authUrl + '/isauthorized').then(({status, data}) => status === 'ok' && data);
  },

  /**
   * Auth response handler
   *
   * @param   {object}  response  response from request
   * @returns {Promise}
   */
  handleAuthResponse(response) {
    return Promise.resolve().then(() => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      localStorage.setItem('AuthData', JSON.stringify(response.data));
      this.setAuthData(response.data);

      //return ATM.init({
      //  token: this.getAuthData('token'),
      //  serverGateway: this.getAuthData('gaaURL')
      //});
    });
  },

  /**
   * Actions after logout
   */
  handleLogoutResponse() {
    this.resetStore();
    //ATM.reset();
  },


  /**
   *
   * --- Setters ---
   *
   */

  /**
   * Set auth data (all or for one key)
   *
   * @param {object|string}   dataOrKey    item data or one object key
   * @param {*}               value        object key value (if dataOrKey is string key)
   */
  setAuthData(dataOrKey = {}, value = null) {
    if (_.isPlainObject(dataOrKey)) {
      this._authData = _.cloneDeep(dataOrKey);
    } else if (typeof dataOrKey === 'string') {
      this._authData[dataOrKey] = value;
    }

    this.trigger(this._authData);
  },

  checkAuthError(error) {
    if (error.includes('jwt expired')) {
      alert('Authorization is expired...');
      this.logout();

      return true;
    }

    return false;
  },


  /**
   *
   * --- Getters ---
   *
   */

  /**
   * Get auth data (all or for one key)
   *
   * @param   {string|null}   key              object key
   * @param   {*}             defaultValue     return value if no data by key
   * @returns {*}
   */
  getAuthData(key = null, defaultValue = null) {
    if (key) {
      return typeof this._authData === 'object' && this._authData.hasOwnProperty(key) ? this._authData[key] : defaultValue;
    }

    return this._authData;
  },

  getUserId() {
    return this.getAuthData('userId');
  },

  /**
   *
   * --- Request methods ---
   *
   */

  /**
   * Sign in handler for login form
   *
   * @param {string}    login
   * @param {string}    password
   * @param {function}  callback     receives error`s message
   */
  signin(login, password, callback = () => null) {
    //API.POST(this.authUrl, {phone, password}).then(response => {
    //  return this.handleAuthResponse(response);
    //
    //}).then(() => {
    //  callback();
    //}).catch(e => {
    //  console.error(e);
    //  callback(e.message);
    //});

    API.POST(this.authUrl, '', {login, password}).then(response => {
      return this.handleAuthResponse(response);

    }).then(() => {
      callback();
    }).catch(e => {
      console.error(e);
      callback(e.message);
    });

    //this.setAuthData('isAuthenticated', true);

    callback();
  },

  /**
   * Logout button handler
   *
   * @param    {function}    callback    receives error`s message
   */
  logout(callback = () => null) {
    localStorage.setItem('AuthData', '');
    this.resetStore();

    callback();
  }

});

let UserProfileStore = Reflux.createStore({

  /**
   * relative url to auth
   */
  apiUrl: (apiPrefix.startsWith('/') ? apiPrefix.slice(1) : apiPrefix) + '/user',

  init() {
    this.listenTo(Actions.ActionsUser.getUser, this.getUser);
    this.listenTo(Actions.ActionsUser.saveUser, this.saveUser);
    this.listenTo(Actions.ActionsUser.deleteUser, this.deleteUser);

    this.resetStore();
  },

  resetStore() {
    this.user = {};
  },

  getUser(userId = AuthorizationStore.getAuthData('userId')) {
    API.GET(`${this.apiUrl}/${userId}`, AuthorizationStore.getAuthData('token')).then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.user = response.data;

      this.trigger(this.user);
    }).catch(e => {
      console.error(e);

      AuthorizationStore.checkAuthError(e.message) || alert(e.message);
    });
  },

  saveUser(user, callback, errorCallback) {
    user.id ?
      API.PUT(`${this.apiUrl}/${user.id}`, AuthorizationStore.getAuthData('token'), user).then(response => {
        if (response.status !== 'ok') {
          throw new Error(response.errorMsg);
        }

        this.user = response.data;

        callback();

        this.trigger(this.user);
      }).catch(e => {
        AuthorizationStore.checkAuthError(e.message) || errorCallback(e.message);
      }) :
      API.POST(`${this.apiUrl}`, AuthorizationStore.getAuthData('token'), user).then(response => {
        if (response.status !== 'ok') {
          throw new Error(response.errorMsg);
        }

        this.user = response.data;

        callback();

        this.trigger(this.user);
      }).catch(e => {
        AuthorizationStore.checkAuthError(e.message) || errorCallback(e.message);
      });
  },

  deleteUser(id, callback) {
    API.DELETE(`${this.apiUrl}/${id}`, AuthorizationStore.getAuthData('token')).then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.user = response.data;

      callback();

      this.trigger(this.user);
    }).catch(e => {
      AuthorizationStore.checkAuthError(e.message) || alert(e.message);
    });
  }

});

let UsersStore = Reflux.createStore({

  /**
   * relative url to user
   */
  apiUrl: (apiPrefix.startsWith('/') ? apiPrefix.slice(1) : apiPrefix) + '/user',

  init() {
    this.listenTo(Actions.ActionsUsers.getUsers, this.getUsers);

    this.resetStore();
  },

  resetStore() {
    this.user = {};
  },

  getUsers() {
    API.GET(`${this.apiUrl}`, AuthorizationStore.getAuthData('token')).then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.users = response.data;

      this.trigger(this.users);
    }).catch(e => {
      console.error(e);

      AuthorizationStore.checkAuthError(e.message) || alert(e.message);
    });
  },

  saveUser(user, userId, callback) {
    API.PUT(`${this.apiUrl}/${userId}`, AuthorizationStore.getAuthData('token'), user).then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.user = response.data;

      this.trigger(this.user);
    }).catch(e => {
      AuthorizationStore.checkAuthError(e.message) || callback(e.message);
    });
  }

});

let ParsingStore = Reflux.createStore({

  /**
   * relative url to search
   */
  apiUrl: (apiPrefix.startsWith('/') ? apiPrefix.slice(1) : apiPrefix) + '/search',

  init() {
    this.listenTo(Actions.ActionsParsing.getLines, this.getLines);
    this.listenTo(Actions.ActionsParsing.search, this.search);

    this.resetStore();
  },

  resetStore() {
    this.lines = {};
  },

  getLines() {
    API.GET(`${this.apiUrl}/lines`).then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.lines = response.data;

      this.trigger({lines: this.lines});
    }).catch(e => {
      console.error(e);

      AuthorizationStore.checkAuthError(e.message) || alert(e.message);
    });
  },

  search(line, searchString) {
    API.GET(`${this.apiUrl}/${line}/${searchString}`, AuthorizationStore.getAuthData('token')).then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.data = response.data;

      console.info(response);

      this.trigger({data: this.data});
    }).catch(e => {
      console.error(e);

      AuthorizationStore.checkAuthError(e.message) || alert(e.message);
    });
  }

});

let ContainerStore = Reflux.createStore({

  /**
   * relative url to container
   */
  apiUrl: apiPrefix.startsWith('/') ? apiPrefix.slice(1) : apiPrefix,

  init() {
    this.listenTo(Actions.ActionsContainer.save, this.save);
    this.listenTo(Actions.ActionsContainer.getContainers, this.getContainers);
    this.listenTo(Actions.ActionsContainer.filter, this.filter);
    this.listenTo(Actions.ActionsContainer.delete, this.delete);
    this.listenTo(Actions.ActionsContainer.refresh, this.refresh);
    this.listenTo(Actions.ActionsContainer.resetStore, this.resetStore);
    this.listenTo(Actions.ActionsContainer.showLocation, this.showLocation);

    this.resetStore();
  },

  resetStore() {
    this.actionResult = null;
    this.filters = {
      number: '',
      billOfLading: '',
      line: ''
    };
  },

  save(data) {
    API.POST(`${this.apiUrl}/container`, AuthorizationStore.getAuthData('token'), data).then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.trigger({actionResult: 'saved'});
    }).catch(e => {
      console.error(e);

      AuthorizationStore.checkAuthError(e.message) || alert(e.message);
    });
  },

  getContainers() {
    API.GET(`${this.apiUrl}/container/${AuthorizationStore.getAuthData('userId')}`, AuthorizationStore.getAuthData('token')).then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.data = response.data;

      console.info(response);

      this.filter(this.filters);
    }).catch(e => {
      console.error(e);

      AuthorizationStore.checkAuthError(e.message) || alert(e.message);
    });
  },

  filter({number, billOfLadingNumber, line}) {

    this.filters = {
      number,
      billOfLadingNumber,
      line
    };

    const data = number || billOfLadingNumber || line ? this.data.filter(container => {
      let filtered = true;

      filtered && number && (filtered = container.number === number);
      filtered && billOfLadingNumber && (filtered = container.billOfLadingNumber === billOfLadingNumber);
      filtered && line && (filtered = container.line === line);

      return filtered;
    }) : this.data;

    this.trigger({data});

  },

  delete(ids, userId = AuthorizationStore.getUserId()) {
    API.DELETE(`${this.apiUrl}/container/${userId}?ids=${JSON.stringify(ids)}`, AuthorizationStore.getAuthData('token'))
    .then(response => {
      if (response.status !== 'ok') {
        throw new Error(response.errorMsg);
      }

      this.data = response.data;

      this.getContainers();
    }).catch(e => {
      console.error(e);

      AuthorizationStore.checkAuthError(e.message) || alert(e.message);
    });
  },

  refresh(ids) {
    API.PUT(`${this.apiUrl}/container?ids=${JSON.stringify(ids)}`, AuthorizationStore.getAuthData('token'))
      .then(response => {
        if (response.status !== 'ok') {
          throw new Error(response.errorMsg);
        }

        this.data = response.data;

        this.getContainers();
      }).catch(e => {
        console.error(e);

        AuthorizationStore.checkAuthError(e.message) || alert(e.message);
      });
  },

  showLocation(vesselName, line = '') {
    if (!vesselName) {
      this.trigger({vesselLocation: {}});

      return;
    }

    // todo: drop stubbed vessel's name
    vesselName = 'RIO CHARA';
    //

    API.GET(`${this.apiUrl}/tracking/vessel/${vesselName}?line=${line}`, AuthorizationStore.getAuthData('token'))
      .then(response => {
        if (response.status !== 'ok') {
          throw new Error(response.errorMsg);
        }

        const {lat, lon, timestamp} = response.data;

        this.trigger({vesselLocation: {lat, lon, timestamp}});
      }).catch(e => {
        console.error(e);

        AuthorizationStore.checkAuthError(e.message) || alert(e.message);
      });
  }

});

let LoaderStore = Reflux.createStore({
  init() {
    this.listenTo(Actions.LoaderActions.setShow, this.setShow);
    this.resetStore();
  },

  resetStore() {
    this.countOfRequests = 0;
    this.delayTime = 500;
    this.timer = null;
  },

  /**
   * Show/hide loader
   *
   * @param  {boolean}  show
   */
  setShow(show) {
    this.countOfRequests += show ? 1 : -1;

    if (![0, 1].includes(this.countOfRequests)) {
      return;
    }

    if (this.countOfRequests) {
      !this.timer && (this.timer = setTimeout(() => this.trigger({show: true}), this.delayTime));
    } else {
      this.timer && clearTimeout(this.timer);
      this.timer = null;
      this.trigger({show: false});
    }
  }

});

let PopoverWindowStore = Reflux.createStore({
  init() {
    this.listenTo(Actions.ActionsPopoverWindow.showStandardMessage, this.showStandardMessage);
    this.listenTo(Actions.ActionsPopoverWindow.showError, this.showError);
    this.listenTo(Actions.ActionsPopoverWindow.showServerError, this.showServerError);
  },

  /**
   * Show standard message by key from core.{language}.json popoverWindow.messages
   *
   * @param {string}  message key
   * @param {object}  params
   */
  showStandardMessage(message, params = {}) {
    this.trigger({
      type: 'standardMessageKey',
      message,
      params
    });
  },

  /**
   * Show custom error message
   *
   * @param {string}  message
   */
  showError(message) {
    this.trigger({
      type: 'errorMessage',
      message
    });
  },

  /**
   * Show server default error message (original message will be logged to console) with checking if internet is available
   *
   * @param {string}  message
   */
  showServerError(message) {
    this.trigger({
      type: 'serverErrorMessage',
      message
    });
  }

});

export default {
  AuthorizationStore,
  UserProfileStore,
  UsersStore,
  ParsingStore,
  ContainerStore,
  LoaderStore,
  PopoverWindowStore
};
