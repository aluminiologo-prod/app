module.exports = function (api) {
  // Cache keyed by NODE_ENV so test vs. dev/prod get separate configs.
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: [
      [
        'expo/internal/babel-preset',
        // NativeWind v4 requires jsxImportSource so the className prop is
        // transformed into StyleSheet calls at compile time.
        // Skip in Jest — the Node environment does not need the JSX transform.
        isTest ? {} : { jsxImportSource: 'nativewind' },
      ],
    ],
    plugins: [
      // react-native-reanimated/plugin installs worklets globals on the native
      // runtime. It must be last and is incompatible with Jest/Node.
      ...(isTest ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
