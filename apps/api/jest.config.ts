export default {
  displayName: 'api',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  rootDir: '../apps/api',

  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/api',
};
