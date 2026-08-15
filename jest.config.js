import { defineConfig } from 'jest-config'

export default defineConfig({
  preset: '@vue/test-utils',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['vue', 'js', 'ts', 'json'],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).js'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@views/(.*)$': '<rootDir>/src/views/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1'
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{js,ts,vue}',
    '!src/**/*.d.ts',
    '!src/**/node_modules/**',
    '!src/**/dist/**',
    '!src/**/coverage/**'
  ]
})