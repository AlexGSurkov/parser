'use strict';

import Path from 'path';

/**
 * Need to show info messages
 */
const showDebugMessages = false;


/**
 *
 * Autoload translations context
 *
 */

/**
 * Require context mapping
 */
let requireData = {
  context: null,
  files: []
};

/**
 * Get all app translation files in hash table
 */
(() => {
  // tip: do not extract root path and regexp to variables - webpack cant statically parse these values
  requireData.context = require.context('../../', true, /\/locales\/\w+\.(ua|en|ru)\.json$/);
  requireData.files = requireData.context.keys().map(path => Path.basename(path));
  _info(`Translation files found: ${requireData.context.keys()}`);
})();

class Locales {
  static getMessages(locale) {
    locale = locale === 'uk' ? 'ua' : locale;
    
    const re = new RegExp(`.(${locale})\.json$`),
      messages = Object.assign(
        ...requireData.context.keys().filter(path => re.test(path)).map(path => {
          const localeKey = Path.basename(path).slice(0, -8);

          return {[localeKey]: requireData.context(path)};
        })
      );

    return flattenMessages(messages);
  }
}

export default Locales;

/**
 * Show console.info message
 *
 * @param   {string[]}   args   message(s)
 */
function _info(...args) {
  showDebugMessages && console.info(...args);
}

/**
 * Flatten locale messages
 *
 * @param   {object}   nestedMessages
 * @param   {string}   [prefix='']
 * @returns {object}
 */
function flattenMessages(nestedMessages, prefix = '') {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    let value = nestedMessages[key],
      prefixedKey = prefix ? `${prefix}.${key}` : key;

    typeof value === 'string' || !value
      ? messages[prefixedKey] = value || ''
      : Object.assign(messages, flattenMessages(value, prefixedKey));

    return messages;
  }, {});
}
