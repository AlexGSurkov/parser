'use strict';

const fs = require('fs');

module.exports = {

  /**
   * Render admin page with query build date as query key
   *
   * @param    {object}    req
   * @param    {object}    res
   */
  render(req, res) {
    fs.stat('assets/bundle.admin.js', (err, {mtime} = {}) => {
      //eslint-disable-next-line no-magic-numbers
      const version = err ? Math.floor((Math.random() + 1) * Math.pow(10, 15)) : mtime.getTime();

      res.view('admin', {version});
    });
  }
};
