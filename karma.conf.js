module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      'lib/yapi.js',
      'test/*.js'
    ]
  });
};
