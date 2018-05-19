'use strict';

module.exports = function (grunt) {

  grunt.registerTask('megapassword', function(password) {
    const done = this.async(),
      bcrypt = require('bcrypt-nodejs'),
      fs = require('fs');

    let hashpassword;

    password = password ? password.trim() : '';

    if (password.length && password.length < 5) { //eslint-disable-line no-magic-numbers
      console.log("\n\x1b[31mLength of megapassword should be 5 symbols or more\x1b[0m\n"); //eslint-disable-line no-console
      return done(false);
    }

    hashpassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8)); //eslint-disable-line no-magic-numbers
    fs.writeFileSync(__dirname + '/../../config/megapassword.js', 'module.exports = { password: \'' + (password.length ? hashpassword : '') + '\' };');
    grunt.log.writeln(password.length ? 'Megapassword is installed' : 'Megapassword is removed');
    done();
  });
};

