module.exports = {
  preset: 'react-native',
  setupFiles: ['./src/__tests__/setupMocks.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@tanstack|zustand|react-native-vector-icons|@react-native-async-storage|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-url-polyfill)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '@env': '<rootDir>/src/__tests__/__mocks__/@env.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    'testQueryWrapper',
    '__mocks__',
    'setupMocks\\.ts$',
    'src/__tests__/setup\\.ts$',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
};
