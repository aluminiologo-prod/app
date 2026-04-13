/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',


  // Runs after the Jest test framework is installed in the environment,
  // before each test file. Use this for custom matchers and global mocks.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Resolve path aliases and stub problematic native modules that crash Node.js
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // expo/virtual/streams installs ReadableStream polyfills that conflict with
    // Node's built-in streams when required in the jest-expo setup phase.
    '^expo/virtual/streams$': '<rootDir>/src/__mocks__/empty.js',
  },

  // Extend the jest-expo preset's transformIgnorePatterns to include additional
  // packages that ship un-transpiled ESM. We merge with the preset's own list
  // which already covers react-native, expo, @expo, @react-native, etc.
  transformIgnorePatterns: [
    '/node_modules/(?!(' +
      '.pnpm' +
      '|react-native' +
      '|@react-native' +
      '|@react-native-community' +
      '|expo' +
      '|@expo' +
      '|@expo-google-fonts' +
      '|react-navigation' +
      '|@react-navigation' +
      '|@sentry/react-native' +
      '|native-base' +
      '|lucide-react-native' +
      '|@gorhom' +
      '|react-native-gesture-handler' +
      '|react-native-safe-area-context' +
      '|react-native-screens' +
      '|react-native-toast-message' +
      '|nativewind' +
      '|react-native-css-interop' +
      '|@tanstack/react-query' +
      '))',
    '/node_modules/react-native-reanimated/plugin/',
  ],

  // Collect coverage from source files only
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/locales/**',
    '!src/i18n/**',
  ],

  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
