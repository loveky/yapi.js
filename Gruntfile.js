
module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['lib/*.js']
    },
    watch: {
      files: ['lib/*.js'],
      tasks: ['jshint']
    },
    uglify: {
      dist: {
        files: {
          'dist/yapi.min.js': ['lib/yapi.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['jshint', 'uglify'])
  grunt.registerTask('default', ['watch']);
};