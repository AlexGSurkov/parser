module.exports = function (grunt) {
  //grunt.registerTask('default', ['compileAssets', 'linkAssets',  'watch']);

  grunt.registerTask('default', [
    // from compileAssets
    'clean:dev',
    'copy:dev',
    'watch'
  ]);
};
