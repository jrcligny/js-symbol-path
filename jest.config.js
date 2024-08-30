module.exports = async () =>
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
			"**/*.spec.e2e.js",
			"**/*.spec.int.js",
			"**/*.spec.unit.js",
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