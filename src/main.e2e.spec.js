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
			expect(output).toEqual(expect.stringContaining('get-path  get symbol path at line <line> in file at <file>'))
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
			expect(output).toEqual(expect.stringContaining('get symbol path at line <line> in file at <file>'))
			// -options section
			expect(output).toEqual(expect.stringContaining('  -h, --help     Show help                                             [boolean]'))
			expect(output).toEqual(expect.stringContaining('  -f, --file     Load a file                                 [string] [required]'))
			expect(output).toEqual(expect.stringContaining('  -l, --line     Line to get the symbol path for (1-based)   [number] [required]'))
			expect(output).toEqual(expect.stringContaining('  -v, --version  Show version number                                   [boolean]'))
		})
	
		it.each([
			{ arg: 'get-path -f ./resources/lib-sample.js -l 1',
				expected: '{"file":"./resources/lib-sample.js","line":1,"path":"DirectoryListHandler"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 2',
				expected: '{"file":"./resources/lib-sample.js","line":2,"path":"DirectoryListHandler.constructor"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 3',
				expected: '{"file":"./resources/lib-sample.js","line":3,"path":"DirectoryListHandler.constructor"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 4',
				expected: '{"file":"./resources/lib-sample.js","line":4,"path":"DirectoryListHandler.constructor"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 11',
				expected: '{"file":"./resources/lib-sample.js","line":11,"path":"DirectoryListHandler.reset"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 12',
				expected: '{"file":"./resources/lib-sample.js","line":12,"path":"DirectoryListHandler.reset"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 13',
				expected: '{"file":"./resources/lib-sample.js","line":13,"path":"DirectoryListHandler.reset"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 14',
				expected: '{"file":"./resources/lib-sample.js","line":14,"path":"DirectoryListHandler.reset"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 15',
				expected: '{"file":"./resources/lib-sample.js","line":15,"path":"DirectoryListHandler"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 17',
				expected: '{"file":"./resources/lib-sample.js","line":17,"path":"instantiate"}'
			},
			{ arg: 'get-path -f ./resources/lib-sample.js -l 19',
				expected: '{"file":"./resources/lib-sample.js","line":19,"path":"instantiate"}'
			},
			{ arg: 'get-path -f ./resources/lib-with-namespace-sample.js -l 6',
				expected: '{"file":"./resources/lib-with-namespace-sample.js","line":6,"path":"FileSystem.Directory.DirectoryListHandler.constructor"}'
			},
			{ arg: 'get-path -f ./resources/lib-empty-sample.js -l 2',
				expected: '{"file":"./resources/lib-empty-sample.js","line":2,"path":""}'
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
	})
})
