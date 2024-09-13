# js-symbol-path

## Usage

Assuming a source file is not minified, this package provides a command-line interface to get the path to a symbol in a file at a specific line and to map diffs to their corresponding symbol paths.

### `get-path`

`file` is the source file in which the symbol path is to be found.

```bash
node dist/index.cjs get-path --file filename --line line --plain
# output <symbol_path>
node dist/index.cjs get-path --file filename --line line --json --minified
# output {"file":"filename","line":line,"path":"<symbol_path>"}
```

### `map-diffs-to-paths`

This command maps the diffs to their corresponding symbol paths.
`diff-file` contains diffs in the format `<line>|<status>|<diff>`
`file` is the source file in which all diffs are applied.

```bash
node dist/index.cjs map-diffs-to-paths --file filename --diff-file diff-filename --plain
# output <line>|<symbol_path>|<status>|<diff>
node dist/index.cjs map-diffs-to-paths --file filename --diff-file diff-filename --json --minified
# output [{"symbol":"<symbol_path>","line":<line>,"status": "<status>", "content":"<diff>"}
```

## References

- [Command Line Interface Guidelines](https://clig.dev/)

## Contributing

### Visual Studio Code tasks

- `Run tests`: Run all tests and may generate coverage report
- `Run Current Spec File`: Run the current spec file
- `Run Related Spec File`: Run the spec file related to the current source file. The test suite description must match the source filename.
- `Open Coverage Report`: Open the coverage report in the default browser

### Visual Studio Code debugger

- `Debug Jest Tests`

### NPM scripts

- `test`: Run all tests and generate coverage report
- `lint`: Lint JavaScript files
- `package`: Package the project
- `all`: Run all tests, generate coverage report, lint files, and package the project.
