module.exports = function (grunt) {
  grunt.registerTask('prod', [
    'clean:dev',
    'copy:dev'
    // 'compileAssets',
    // 'concat',
    // 'uglify',
    // 'cssmin',
    // 'sails-linker:prodJs',
    // 'sails-linker:prodStyles',
    // 'sails-linker:devTpl',
    // 'sails-linker:prodJsJade',
    // 'sails-linker:prodStylesJade',
    // 'sails-linker:devTplJade'
  ]);
};
