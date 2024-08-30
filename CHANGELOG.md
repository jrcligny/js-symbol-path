# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Use `esbuild` for bundling.

## [v1.0.2] - 2024-08-10

### Changed

- Update ESLint version to `9.9.0` and use flat configuration file.

## [v1.0.1] - 2024-08-03

### Added

- Jest can run `*.spec.js` file.

### Changed

- Visual Studio Code tasks to run specific Jest tests (`Run Current Spec File`, `Run Related Spec File`) do not generate coverage reports.

### Removed

- Remove linter rules for Markedown files (too many false positives).
- Remove use of `super-linter` (too many false positives).

### Fixed

- ESLint command use the default configuration file set in `package.json`.

## [v1.0.0] - 2024-07-31

### Added

- Add `Changelog.md` file
- Set recommended Visual Studio Code extensions: `github.copilot`, `vscode-pull-request-github`, `dbaeumer.vscode-eslint`
- Setup Jest:
  - Set basic Jest configuration with coverage report. Test files are located alongside the source files, following the `*.spec.(e2e|int|unit).js` naming convention.
  - Set Visual Studio Code tasks to run Jest tests: `Run tests`, `Run Current Spec File`, `Run Related Spec File`, `Open Coverage Report`
  - Set Visual Studio Code launch configurations to run Jest tests: `Debug Jest Tests`
- Set basic GitHub Actions workflows (codeql, linter, ci)
- Set linter rules for Markedown files, and JavaScript files
