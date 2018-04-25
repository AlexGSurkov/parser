"use strict";

module.exports = function (grunt) {

  grunt.config.set('eslint', {
      browserFiles: {
        src: ["app/**/*.js", "app/**/*.jsx"],
        options: {
          configFile: __dirname + "/eslint-browser.json"
        }
      },

      nodeFiles: {
        src: ['api/**/*.js', 'libs/*.js'],
        options: {
          configFile: __dirname + "/eslint-node.json"
        }
      }
  });

  grunt.loadNpmTasks('gruntify-eslint');
};
