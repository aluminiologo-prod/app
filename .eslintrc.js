module.exports = {
  extends: 'expo',
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', 'android/', 'ios/', 'coverage/'],
  overrides: [
    {
      // Jest setup and test files: allow require() and unused vars in mocks
      files: ['jest.setup.ts', '**/__tests__/**/*.{ts,tsx}', '**/__mocks__/**/*.{js,ts}'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-commonjs': 'off',
      },
    },
  ],
};
