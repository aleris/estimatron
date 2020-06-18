const path = require('path')
const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

const basePath = path.resolve(__dirname, '..') + '/'

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: basePath }),
  'globals': {
    'window': {}
  }
}
