// external dependencies
import { expect, jest, } from '@jest/globals'
// internal dependencies
import parser from './main'

describe('main', () => {

	describe('no-command', () => {
		it.each([
			{ input: '--help' },
			{ input: '--h' },
			{ input: '' },
		])('returns help output', async ({ input }) => {
			// Arrange
	
			// Act
			// run the command module with --help as argument
			const output = await new Promise((resolve) => {
				parser.parse(input, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			// verify the output is correct
			// -command section
			expect(output).toEqual(expect.stringContaining('map-diffs-to-paths  Based on <file>'))
			expect(output).toEqual(expect.stringContaining('get-path            Get symbol path'))
			// -options section
			expect(output).toEqual(expect.stringContaining('  -h, --help     Show help                                             [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -v, --version  Show version number                                   [boolean]'))
		})
	})

	describe('get-path', () => {

		it.each([
			{ input: 'get-path --help' },
			{ input: 'get-path --help' },
			{ input: 'get-path' },
		])('returns help output', async ({ input }) => {
			// Arrange
	
			// Act
			// run the command module with --help as argument
			const output = await new Promise((resolve) => {
				parser.parse(input, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			// verify the output is correct
			expect(output).toEqual(expect.stringContaining('Get symbol path at line <line> in file at <file>.'))
			// -options section
			expect(output).toEqual(expect.stringContaining('  -h, --help      Show help                                            [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -f, --file      Source file to load                        [string] [required]'))
			expect(output).toEqual(expect.stringContaining('  -l, --line      Line to get the symbol path for (1-based)  [number] [required]'))
			expect(output).toEqual(expect.stringContaining('  -v, --version   Show version number                                  [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -j, --json      Output the result as JSON                            [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -m, --minified  Output the result as minified JSON                   [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -p, --plain     Output the result as plain text                      [boolean]'))
		})
	
		it.each([
			{ arg: 'get-path -f ./resources/lib-sample.js -l 1',
				expected: 'DirectoryListHandler'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 2',
				expected: 'DirectoryListHandler.constructor'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 3',
				expected: 'DirectoryListHandler.constructor'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 4',
				expected: 'DirectoryListHandler.constructor'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 45',
				expected: 'DirectoryListHandler.reset'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 46',
				expected: 'DirectoryListHandler.reset'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 47',
				expected: 'DirectoryListHandler.reset'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 48',
				expected: 'DirectoryListHandler.reset'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 49',
				expected: 'DirectoryListHandler'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 51',
				expected: 'instantiate'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 52',
				expected: 'instantiate'
			},
			{ arg: 'get-path -f ./resources/lib-with-namespace-sample.js -l 6',
				expected: 'FileSystem.Directory.DirectoryListHandler.constructor'
			},
			{ arg: 'get-path -f ./resources/lib-empty-sample.js -l 2',
				expected: ''
			},
		])('returns the symbol path for the command "$arg"', async ({ arg, expected }) => {
			// Arrange
			const mockConsoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {})
	
			// Act
			// run the command module with the file and line arguments
			const output = await new Promise((resolve) => {
				parser.parse(arg, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			expect(mockConsoleLog).toHaveBeenCalledWith(expected)
			expect(output).toBe('')
		})

		it('returns the symbol path in JSON format when "json" flag is enabled', async () => {
			// Arrange
			const arg = 'get-path -f ./resources/lib-sample.js -l 2 -j'
			const mockConsoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {})
	
			// Act
			// run the command module with the file and line arguments
			const output = await new Promise((resolve) => {
				parser.parse(arg, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			expect(mockConsoleLog).toHaveBeenCalledWith(JSON.stringify({"file":"./resources/lib-sample.js","line":2,"path":"DirectoryListHandler.constructor"}, null, 2))
			expect(output).toBe('')
		})

		it('returns the symbol path in minified JSON format when "json" and "minified" flags are enabled', async () => {
			// Arrange
			const arg = 'get-path -f ./resources/lib-sample.js -l 2 --json --minified'
			const mockConsoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {})
	
			// Act
			// run the command module with the file and line arguments
			const output = await new Promise((resolve) => {
				parser.parse(arg, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			expect(mockConsoleLog).toHaveBeenCalledWith(JSON.stringify({"file":"./resources/lib-sample.js","line":2,"path":"DirectoryListHandler.constructor"}))
			expect(output).toBe('')
		})

		it('raises an error when the file does not exist', async () => {
			// Arrange
			const arg = 'get-path -f ./resources/invalid-file.js -l 1'
			const mockConsoleError = jest.spyOn(global.console, 'error').mockImplementation(() => {})
	
			// Act
			// run the command module with the file and line arguments
			const output = await new Promise((resolve, reject) => {
				parser.parse(arg, (err, argv, output) => {
					if (err) reject(err)
					else resolve(output)
				})
			})

			// Assert
			expect(mockConsoleError).toHaveBeenCalledTimes(1)
			expect(output).toBe('')
		})
	})

	describe('map-diffs-to-paths', () => {
		
		it.each([
			{ input: 'map-diffs-to-paths --help' },
			{ input: 'map-diffs-to-paths --help' },
			{ input: 'map-diffs-to-paths' },
		])('returns help output', async ({ input }) => {
			// Arrange
	
			// Act
			// run the command module with --help as argument
			const output = await new Promise((resolve) => {
				parser.parse(input, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			// verify the output is correct
			expect(output).toEqual(expect.stringContaining('Based on <file>, get symbol path for each diff listed in <diff-file>'))
			// -options section
			expect(output).toEqual(expect.stringContaining('  -d, --diff-file  Diff file to load to get the diffs.       [string] [required]'))
			expect(output).toEqual(expect.stringContaining('  -f, --file       Source file to load                       [string] [required]'))
			expect(output).toEqual(expect.stringContaining('  -h, --help       Show help                                           [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -v, --version    Show version number                                 [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -j, --json       Output the result as JSON                           [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -m, --minified   Output the result as minified JSON                  [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -p, --plain      Output the result as plain text                     [boolean]'))
		})

		it('returns the symbol paths for each diff using lib-sample.js in JSON format when "json" flag is enabled', async () => {
			// Arrange
			const arg = 'map-diffs-to-paths -f ./resources/lib-sample.js -d ./resources/lib-sample.diff --json'
			const mockConsoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {})
	
			// Act
			// run the command module with the file and line arguments
			const output = await new Promise((resolve) => {
				parser.parse(arg, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			expect(mockConsoleLog).toHaveBeenCalledWith(JSON.stringify([
				{
					"symbol": "DirectoryListHandler.constructor",
					"line": 4,
					"status": "M",
					"content": "for (let i = 0; i < directories.length; i++) {"
				},
				{
					"symbol": "DirectoryListHandler.constructor",
					"line": 5,
					"status": "M",
					"content": "this.addDirectory(directories[i]);"
				},
				{
					"symbol": "DirectoryListHandler.constructor",
					"line": 6,
					"status": "M",
					"content": "}"
				},
				{
					"symbol": "DirectoryListHandler.addDirectory.findCallback",
					"line": 16,
					"status": "A",
					"content": "// Return true if the directory already exists"
				},
				{
					"symbol": "DirectoryListHandler.addDirectory.findCallback",
					"line": 17,
					"status": "M",
					"content": "return d === directory;"
				},
				{
					"symbol": "DirectoryListHandler",
					"line": 30,
					"status": "M",
					"content": "* Remove a directory from the list"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 35,
					"status": "A",
					"content": "const filterCallback = function(d) {"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 36,
					"status": "A",
					"content": "// Return all directories that are not the one we want to remove"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 37,
					"status": "A",
					"content": "return d !== directory;"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 38,
					"status": "A",
					"content": "}"
				},
				{
					"symbol": null,
					"line": 50,
					"status": "A",
					"content": ""
				},
				{
					"symbol": null,
					"line": 51,
					"status": "A",
					"content": "export function instantiate(directories) {"
				},
				{
					"symbol": null,
					"line": 52,
					"status": "A",
					"content": "return new DirectoryListHandler(directories);"
				},
				{
					"symbol": null,
					"line": 53,
					"status": "A",
					"content": "}"
				},
				{
					"symbol": null,
					"line": 54,
					"status": "A",
					"content": ""
				}
			], null, 2))
			expect(output).toBe('')
		})

		it('returns the symbol paths for each diff using lib-sample.js in minified JSON format when "json" and "minified" flags are enabled', async () => {
			// Arrange
			const arg = 'map-diffs-to-paths -f ./resources/lib-sample.js -d ./resources/lib-sample.diff -jm'
			const mockConsoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {})
	
			// Act
			// run the command module with the file and line arguments
			const output = await new Promise((resolve) => {
				parser.parse(arg, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			expect(mockConsoleLog).toHaveBeenCalledWith(JSON.stringify([
				{
					"symbol": "DirectoryListHandler.constructor",
					"line": 4,
					"status": "M",
					"content": "for (let i = 0; i < directories.length; i++) {"
				},
				{
					"symbol": "DirectoryListHandler.constructor",
					"line": 5,
					"status": "M",
					"content": "this.addDirectory(directories[i]);"
				},
				{
					"symbol": "DirectoryListHandler.constructor",
					"line": 6,
					"status": "M",
					"content": "}"
				},
				{
					"symbol": "DirectoryListHandler.addDirectory.findCallback",
					"line": 16,
					"status": "A",
					"content": "// Return true if the directory already exists"
				},
				{
					"symbol": "DirectoryListHandler.addDirectory.findCallback",
					"line": 17,
					"status": "M",
					"content": "return d === directory;"
				},
				{
					"symbol": "DirectoryListHandler",
					"line": 30,
					"status": "M",
					"content": "* Remove a directory from the list"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 35,
					"status": "A",
					"content": "const filterCallback = function(d) {"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 36,
					"status": "A",
					"content": "// Return all directories that are not the one we want to remove"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 37,
					"status": "A",
					"content": "return d !== directory;"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 38,
					"status": "A",
					"content": "}"
				},
				{
					"symbol": null,
					"line": 50,
					"status": "A",
					"content": ""
				},
				{
					"symbol": null,
					"line": 51,
					"status": "A",
					"content": "export function instantiate(directories) {"
				},
				{
					"symbol": null,
					"line": 52,
					"status": "A",
					"content": "return new DirectoryListHandler(directories);"
				},
				{
					"symbol": null,
					"line": 53,
					"status": "A",
					"content": "}"
				},
				{
					"symbol": null,
					"line": 54,
					"status": "A",
					"content": ""
				}
			]))
			expect(output).toBe('')
		})

		it('returns the symbol paths for each diff using lib-sample.js in plain format', async () => {
			// Arrange
			const arg = 'map-diffs-to-paths -f ./resources/lib-sample.js -d ./resources/lib-sample.diff'
			const mockConsoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {})
	
			// Act
			// run the command module with the file and line arguments
			const output = await new Promise((resolve) => {
				parser.parse(arg, (err, argv, output) => {
					resolve(output)
				})
			})
	
			// Assert
			expect(mockConsoleLog).toHaveBeenCalledTimes(15)
			expect(mockConsoleLog).toHaveBeenCalledWith('4|DirectoryListHandler.constructor|M|for (let i = 0; i < directories.length; i++) {')
			expect(mockConsoleLog).toHaveBeenCalledWith('5|DirectoryListHandler.constructor|M|this.addDirectory(directories[i]);')
			expect(mockConsoleLog).toHaveBeenCalledWith('6|DirectoryListHandler.constructor|M|}')
			expect(mockConsoleLog).toHaveBeenCalledWith('51||A|export function instantiate(directories) {')
			expect(mockConsoleLog).toHaveBeenCalledWith('53||A|}')
			expect(mockConsoleLog).toHaveBeenCalledWith('54||A|')
			expect(output).toBe('')
		})

		it('raises an error when the file does not exist', async () => {
			// Arrange
			const arg = 'map-diffs-to-paths -f ./resources/invalid-file.js -d ./resources/lib-sample.diff'
			const mockConsoleError = jest.spyOn(global.console, 'error').mockImplementation(() => {})
	
			// Act
			// run the command module with the file and line arguments
			const output = await new Promise((resolve, reject) => {
				parser.parse(arg, (err, argv, output) => {
					if (err) reject(err)
					else resolve(output)
				})
			})

			// Assert
			expect(mockConsoleError).toHaveBeenCalledTimes(1)
			expect(output).toBe('')
		})
	})
})
