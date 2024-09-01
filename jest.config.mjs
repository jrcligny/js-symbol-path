export default async () =>
{
	return {
		"verbose": true,
		"clearMocks": true,
		"testEnvironment": "node",
		"moduleFileExtensions": [
			"js"
		],
		"testMatch": [
			"**/*.spec.js",
			"**/*.e2e.spec.js",
			"**/*.int.spec.js",
			"**/*.unit.spec.js",
		],
		"testPathIgnorePatterns": [
			"/node_modules/",
			"/dist/",
		],
		"coverageReporters": [
			"json-summary",
			"text",
			"lcov",
		],
		"collectCoverage": true,
		"collectCoverageFrom": [
			"./src/**",
			"!src/index.{js,jsx,ts,tsx}",
		]
	}
}