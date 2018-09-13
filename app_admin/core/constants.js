'use strict';

export default {

  apiURL: __API_URL__ || 'http://localhost:1400/',

  /**
   * Current language for admin
   */
  currentLanguage: 'en',

  /**
   * define existing Languages
   */
  availableLanguages: [
    {title: 'english', value: 'en'},
    {title: 'русский', value: 'ru'},
    {title: 'українська', value: 'uk'}
  ],

  pathPrefix: '/app',
  apiPrefix: '/api'
};
