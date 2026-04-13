module.exports = function (api) {
  // Cache keyed by NODE_ENV so test vs. dev/prod get separate configs.
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: ['expo/internal/babel-preset'],
    // react-native-reanimated/plugin must be last.
    // It installs worklets globals on the native runtime — not compatible
    // with the Jest/Node environment, so it is excluded during tests.
    plugins: isTest ? [] : ['react-native-reanimated/plugin'],
  };
};
