module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "\\.test\\.ts",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverageFrom: ["src/**/*", "!src/@types/*", "!src/server.ts"],
  modulePathIgnorePatterns: ["dist"],
  verbose: true,
  maxWorkers: 1,
  testTimeout: 10000,
  collectCoverage: true,
  coverageDirectory: "./coverage",
};
