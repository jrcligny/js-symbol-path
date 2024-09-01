# js-symbol-path

```bash
node dist/main.js get-path --file filename --line line
# output {"file":"filename","line":line,"path":"path"}
```

## References

- [Command Line Interface Guidelines](https://clig.dev/)

## Usage

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
