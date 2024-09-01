// external dependencies
import { expect, jest, } from '@jest/globals'
import { ScriptKind, ScriptTarget, } from 'typescript'
// internal dependencies
import TypescriptHelper from './typescript-helper'

describe('typescript-helper', () => {

	const mockPath = {
		extname: jest.fn(),
	}
	const mockTypescript = {
		ScriptKind: ScriptKind,
		ScriptTarget: ScriptTarget,
		createSourceFile: jest.fn(),
		isConstructorDeclaration: jest.fn(),
		isClassDeclaration: jest.fn(),
		isFunctionDeclaration: jest.fn(),
		isMethodDeclaration: jest.fn(),
		getLineAndCharacterOfPosition: jest.fn(),
	}

	const createInstance = () => new TypescriptHelper(mockPath, mockTypescript)

	describe('createSourceFile', () => {
		it.each([
			{ extname: '.ts', scriptKind: ScriptKind.TS },
			{ extname: '.cts', scriptKind: ScriptKind.TS },
			{ extname: '.mts', scriptKind: ScriptKind.TS },
			{ extname: '.tsx', scriptKind: ScriptKind.TSX },
			{ extname: '.js', scriptKind: ScriptKind.JS },
			{ extname: '.cjs', scriptKind: ScriptKind.JS },
			{ extname: '.mjs', scriptKind: ScriptKind.JS },
			{ extname: '.jsx', scriptKind: ScriptKind.JSX },
			{ extname: '.unknown', scriptKind: ScriptKind.Deferred },
		])('returns a source file using scriptKind "$scriptKind" engine when file extension is "$extname"', async ({extname, scriptKind}) => {
			// Arrange
			const filename = `test${extname}`
			const content = ''
			mockTypescript.createSourceFile.mockResolvedValue({
				fileName: filename,
				text: content,
			})
			mockPath.extname.mockReturnValue(extname)

			// Act
			const sourceFile = await createInstance().createSourceFile(filename, content)

			// Assert
			expect(sourceFile).toBeDefined()
			expect(mockTypescript.createSourceFile).toHaveBeenNthCalledWith(
				1,
				filename,
				content,
				ScriptTarget.Latest,
				true,
				scriptKind
			)
		})
	})

	describe('getPath', () => {
		it('returns the path of the node', () => {
			// Arrange
			const node = {
				name: { getText: jest.fn().mockReturnValue('nodeName') },
				parent: {
					name: { getText: jest.fn().mockReturnValue('parentName') },
					parent: {
						name: { getText: jest.fn().mockReturnValue('grandParentName') },
						parent: {
							name: undefined,
							parent: undefined,
						},
					},
				},
			}

			// Act
			const path = createInstance().getPath(node)

			// Assert
			expect(path).toBe('grandParentName.parentName.nodeName')
		})

		it('returns the path of the node without parent', () => {
			// Arrange
			const node = {
				name: { getText: jest.fn().mockReturnValue('nodeName') },
				parent: undefined,
			}

			// Act
			const path = createInstance().getPath(node)

			// Assert
			expect(path).toBe('nodeName')
		})

		it('returns the path of the node without name', () => {
			// Arrange
			const node = {
				name: undefined,
				parent: {
					name: { getText: jest.fn().mockReturnValue('parentName') },
					parent: undefined,
				},
			}

			// Act
			const path = createInstance().getPath(node)

			// Assert
			expect(path).toBe('parentName')
		})

		it('returns an empty path when the node does not have name and parent', () => {
			// Arrange
			const node = {
				name: undefined,
				parent: undefined,
			}

			// Act
			const path = createInstance().getPath(node)

			// Assert
			expect(path).toBe('')
		})

		it('returns an empty path when the node is undefined', () => {
			// Arrange
			const node = undefined

			// Act
			const path = createInstance().getPath(node)

			// Assert
			expect(path).toBe('')
		})

		it('returns "constructor" as node name when the node is a constructor declaration', () => {
			// Arrange
			const node = {
				name: { getText: jest.fn().mockReturnValue('constructor') },
				parent: {
					name: { getText: jest.fn().mockReturnValue('parentName') },
					parent: {
						name: { getText: jest.fn().mockReturnValue('grandParentName') },
						parent: undefined,
					},
				},
			}
			mockTypescript.isConstructorDeclaration.mockReturnValueOnce(true)

			// Act
			const path = createInstance().getPath(node)

			// Assert
			expect(path).toBe('grandParentName.parentName.constructor')
		})
	})

	describe('isInRange', () => {
		it.each([
			// 1-based line
			{ line: 5 },
			{ line: 8 },
			{ line: 12 },
		])('returns true when the line "$line" is within the node range (5-12)', ({ line }) => {
			// Arrange
			const node = {
				getStart: jest.fn().mockReturnValue(4461), // character position
				getEnd: jest.fn().mockReturnValue(11646), // character position
				getSourceFile: jest.fn(),
			}
			mockTypescript.getLineAndCharacterOfPosition.mockImplementation((sourceFile, position) => {
				if (position === 4461) return { line: 4 } // 0-based line
				if (position === 11646) return { line: 11 } // 0-based line
			})

			// Act
			const isInRange = createInstance().isInRange(node, line)

			// Assert
			expect(isInRange).toBe(true)
		})

		it.each([
			// 1-based line
			{ line: 1 },
			{ line: 3 },
			{ line: 10 },
		])('returns false when the line "$line" is outside the node range (4-9)', ({ line }) => {
			// Arrange
			const node = {
				getStart: jest.fn().mockReturnValue(4461), // character position
				getEnd: jest.fn().mockReturnValue(11646), // character position
				getSourceFile: jest.fn(),
			}
			mockTypescript.getLineAndCharacterOfPosition.mockImplementation((sourceFile, position) => {
				if (position === 4461) return { line: 3 } // 0-based line
				if (position === 11646) return { line: 8 } // 0-based line
			})

			// Act
			const isInRange = createInstance().isInRange(node, line)

			// Assert
			expect(isInRange).toBe(false)
		})

		it('returns false when the line is "0"', () => {
			// Arrange
			const node = {
				getStart: jest.fn().mockReturnValue(4461), // character position
				getEnd: jest.fn().mockReturnValue(11646), // character position
				getSourceFile: jest.fn(),
			}
			const line = 0

			// Act
			const isInRange = createInstance().isInRange(node, line)

			// Assert
			expect(isInRange).toBe(false)
		})

		it('throws an error when the node is undefined', () => {
			// Arrange
			const node = undefined
			const line = 5

			// Act
			const isInRange = () => createInstance().isInRange(node, line)

			// Assert
			expect(isInRange).toThrow('invalid node')
		})
	})

	describe('isFunctionLikeDeclaration', () => {
		it.each([
			{ type: 'ClassDeclaration' },
			{ type: 'FunctionDeclaration' },
			{ type: 'MethodDeclaration' },
			{ type: 'ConstructorDeclaration' },
		])('returns true when the node is a "$type"', ({ type }) => {
			// Arrange
			const node = {}
			mockTypescript[`is${type}`].mockReturnValueOnce(true)

			// Act
			const isFunctionLikeDeclaration = createInstance().isFunctionLikeDeclaration(node)

			// Assert
			expect(isFunctionLikeDeclaration).toBe(true)
		})

		it('returns false when the node is not a function-like declaration', () => {
			// Arrange
			const node = {}
			mockTypescript.isClassDeclaration.mockReturnValueOnce(false)
			mockTypescript.isFunctionDeclaration.mockReturnValueOnce(false)
			mockTypescript.isMethodDeclaration.mockReturnValueOnce(false)
			mockTypescript.isConstructorDeclaration.mockReturnValueOnce(false)

			// Act
			const isFunctionLikeDeclaration = createInstance().isFunctionLikeDeclaration(node)

			// Assert
			expect(isFunctionLikeDeclaration).toBe(false)
		})
	})
})
