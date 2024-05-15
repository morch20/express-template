/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleDirectories: ["node_modules"],
    clearMocks: true,
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
    moduleNameMapper: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "@/(.*)": "<rootDir>/src/$1",
    },
    modulePathIgnorePatterns: ["dist"],
};
