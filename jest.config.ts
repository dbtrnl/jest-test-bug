import { pathsToModuleNameMapper } from 'ts-jest/utils';
import { compilerOptions } from './tsconfig.json';

export default {
  clearMocks: true,
  collectCoverage: false,
  coverageProvider: 'v8',
  coverageReporters: [
    'text',
    'lcov',
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  preset: 'ts-jest',
  roots: [
    '<rootDir>/src/tests/'
  ],
  transform: {},
  testEnvironment: 'node',
};
