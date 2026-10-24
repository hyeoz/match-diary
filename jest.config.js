module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '\\.(gif|jpg|jpeg|png|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
