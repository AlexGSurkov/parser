'use strict';

import React from 'react';
import Reflux from 'reflux';
import ReactDOM, {render} from 'react-dom';
import Actions from './actions';
import Constants from '../constants';
import {App} from '../../index';

const LanguageStore = Reflux.createStore({

  /**
   * Current language
   */
  currentLanguage: null,
  localStorageKey: 'adminCurrentLanguage',

  init() {
    this.listenTo(Actions.changeLanguage, this.changeLanguage);

    this.currentLanguage = this.getCurrentLanguage() || Constants.currentLanguage;
  },

  changeLanguage(language) {
    this.currentLanguage = language;
    localStorage.setItem(this.localStorageKey, this.currentLanguage);

    // restart app
    ReactDOM.unmountComponentAtNode(document.getElementById("content"));
    render(<App />, document.getElementById('content'));
  },

  getCurrentLanguage() {
    const currentLanguage = localStorage.getItem(this.localStorageKey);

    // replace not existing in react intl locale "ua" by "uk"
    return currentLanguage === 'ua' ? 'uk' : currentLanguage;
  },

  /**
   * Get current language
   *
   * @returns {string|null}
   */
  getLang() {
    return this.currentLanguage;
  }

});

export default LanguageStore;
