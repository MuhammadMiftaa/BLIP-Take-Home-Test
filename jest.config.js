export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["**/test/**/*.test.js"],
  moduleFileExtensions: ["js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/main.js",
    "!src/utils/env.js",
    "!src/utils/logger.js",
    "!src/utils/prisma.js",
  ],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 10000,
  testPathIgnorePatterns: ["/node_modules/"],
};
