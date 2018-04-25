'use strict';

/**
 *
 * Default Access Denied Policy
 *
 */

/**
 * Returns error message that action is not properly set in policies
 *
 * @param  {object}    req
 * @param  {object}    res
 * @param  {function}  next
 */
module.exports = (req, res, next) => {  // eslint-disable-line no-unused-vars
  res.jsonBad('Action for this URL was not properly assigned to any RBAC permissions in policies');
};
