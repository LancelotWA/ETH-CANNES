import type { Config } from "jest";

const config: Config = {
  rootDir: ".",
  testEnvironment: "node",
  testRegex: "test/.*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts"]
};

export default config;
