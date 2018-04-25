'use strict';

import _ from 'lodash';
import Constants from './constants';

function getSupportPhone() {
  return Constants.supportPhone;
}

/**
 * Format user phone number
 *
 * @param   {string}  phone
 * @returns {string}           formatted phone number
 */
function formatUserPhone(phone) {
  return phone.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "+$1 $2 $3 $4 $5");
}

/**
 * Trim object fields recursively
 *
 * @param   {object}   obj
 * @returns {object}
 */
function trimObjectFieldsRecursively(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].trim();
    } else if (Array.isArray(obj[key])) {
      obj[key] = trimArrayItemsRecursively(obj[key]);
    } else if (_.isObject(obj[key])) {
      obj[key] = trimObjectFieldsRecursively(obj[key]);
    }
  });

  return obj;
}

/**
 * Trim array fields recursively
 *
 * @param   {*[]}   arr
 * @returns {*[]}
 */
function trimArrayItemsRecursively(arr) {
  return arr.map(item => {
    if (typeof item === 'string') {
      item = item.trim();
    } else if (Array.isArray(item)) {
      item = trimArrayItemsRecursively(item);
    } else if (_.isObject(item)) {
      item = trimObjectFieldsRecursively(item);
    }

    return item;
  });
}

/**
 * Convert category rgb color to image filename
 *
 * @param   {string} color
 * @returns {string}
 */
function convertColorToFilename(color) {
  return color.match(/\d+/g).join('-') + '.png';
}

/**
 * if style is array - transform it to single object
 *
 * @param   {object|object[]}   style
 * @returns {object}
 */
function convertStyleToObject(style) {
  if (Array.isArray(style)) {
    return style.reduce((result, item) => ({...result, ...item}), {});
  }

  return style;
}

export default {
  getSupportPhone,
  formatUserPhone,
  trimObjectFieldsRecursively,
  trimArrayItemsRecursively,
  convertColorToFilename,
  convertStyleToObject
};
