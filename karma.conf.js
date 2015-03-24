module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      'lib/yapi.js',
      'test/helper.js',
      'test/*_spec.js'
    ],

    browsers: ['Chrome']
  });
};
