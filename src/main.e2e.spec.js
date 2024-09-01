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
			{ arg: 'get-path -f ./resources/lib-sample.js -l 11',
				expected: 'DirectoryListHandler.reset'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 12',
				expected: 'DirectoryListHandler.reset'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 13',
				expected: 'DirectoryListHandler.reset'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 14',
				expected: 'DirectoryListHandler.reset'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 15',
				expected: 'DirectoryListHandler'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 17',
				expected: 'instantiate'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 19',
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
					"line": 3,
					"content": "M|this.directories = directories;"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 8,
					"content": "A|removeDirectory(directory) {"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 9,
					"content": "A|this.directories = this.directories.filter(d => d !== directory);"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 10,
					"content": "A|}"
				},
				{
					"symbol": null,
					"line": 16,
					"content": "A|"
				},
				{
					"symbol": "instantiate",
					"line": 17,
					"content": "A|export function instantiate(directories) {"
				},
				{
					"symbol": "instantiate",
					"line": 18,
					"content": "A|return new DirectoryListHandler(directories);"
				},
				{
					"symbol": "instantiate",
					"line": 19,
					"content": "A|}"
				},
				{
					"symbol": null,
					"line": 20,
					"content": "A|"
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
					"line": 3,
					"content": "M|this.directories = directories;"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 8,
					"content": "A|removeDirectory(directory) {"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 9,
					"content": "A|this.directories = this.directories.filter(d => d !== directory);"
				},
				{
					"symbol": "DirectoryListHandler.removeDirectory",
					"line": 10,
					"content": "A|}"
				},
				{
					"symbol": null,
					"line": 16,
					"content": "A|"
				},
				{
					"symbol": "instantiate",
					"line": 17,
					"content": "A|export function instantiate(directories) {"
				},
				{
					"symbol": "instantiate",
					"line": 18,
					"content": "A|return new DirectoryListHandler(directories);"
				},
				{
					"symbol": "instantiate",
					"line": 19,
					"content": "A|}"
				},
				{
					"symbol": null,
					"line": 20,
					"content": "A|"
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
			expect(mockConsoleLog).toHaveBeenCalledTimes(9)
			expect(mockConsoleLog).toHaveBeenCalledWith('3|DirectoryListHandler.constructor|M|this.directories = directories;')
			expect(mockConsoleLog).toHaveBeenCalledWith('8|DirectoryListHandler.removeDirectory|A|removeDirectory(directory) {')
			expect(mockConsoleLog).toHaveBeenCalledWith('9|DirectoryListHandler.removeDirectory|A|this.directories = this.directories.filter(d => d !== directory);')
			expect(mockConsoleLog).toHaveBeenCalledWith('10|DirectoryListHandler.removeDirectory|A|}')
			expect(mockConsoleLog).toHaveBeenCalledWith('16||A|')
			expect(mockConsoleLog).toHaveBeenCalledWith('17|instantiate|A|export function instantiate(directories) {')
			expect(mockConsoleLog).toHaveBeenCalledWith('18|instantiate|A|return new DirectoryListHandler(directories);')
			expect(mockConsoleLog).toHaveBeenCalledWith('19|instantiate|A|}')
			expect(mockConsoleLog).toHaveBeenCalledWith('20||A|')
			expect(output).toBe('')
		})
	})
})
