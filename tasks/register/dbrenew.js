/**
 * Создание БД и выполнение всех миграций
 */

module.exports = function(grunt) {
  grunt.registerTask('dbrenew', function(token) {
    grunt.task.run([
      'dbdrop',
      'dbcreate',
      'db:migration:up',
      'createAuthToken:' + (token ? token : 'qwerty')
    ]);
  });
};
