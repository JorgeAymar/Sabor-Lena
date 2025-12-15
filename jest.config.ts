
import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next-auth$": "<rootDir>/tests/mocks/next-auth.ts",
  },
  testMatch: ["**/tests/unit/**/*.test.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(next-auth|@auth)/)"
  ],
};

export default config;
