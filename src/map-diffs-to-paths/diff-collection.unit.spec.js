// external dependencies
import { expect, } from '@jest/globals'
// internal dependencies
import DiffCollection, { DiffCollectionFactory } from './diff-collection'

describe('diff-collection', () => {

	const createInstance = (lines) => new DiffCollection(lines)

	describe('factory', () => {
		it('creates a new instance', () => {
			// Arrange
			const factory = new DiffCollectionFactory()

			// Act
			const instance = factory.create(['3|a|line3', '1|M|line1', '2|d|line2', '8|D|line8', '7|m|line7'])

			// Assert
			expect(instance).toBeInstanceOf(DiffCollection)
			expect(instance.toJSON()).toEqual([
				{ symbol: null, line: 3, status: 'A', content: 'line3' },
				{ symbol: null, line: 1, status: 'M', content: 'line1' },
				{ symbol: null, line: 2, status: 'D', content: 'line2' },
				{ symbol: null, line: 8, status: 'D', content: 'line8' },
				{ symbol: null, line: 7, status: 'M', content: 'line7' },
			])
			expect(instance.getRange()).toEqual({ start: 1, end: 8 })
		})

		it.each([
			{ lines: ['|foo'], message: 'invalid line "|foo" (1): line number should be an integer, status should be A, D, or M, diff should not be empty' },
			{ lines: ['M|line1'], message: 'invalid line "M|line1" (1): line number should be an integer, status should be A, D, or M, diff should not be empty' },
			{ lines: ['2|line2'], message: 'invalid line "2|line2" (1): status should be A, D, or M, diff should not be empty' },
			{ lines: ['2|D|content', '0'], message: 'invalid line "0" (2): line number should be greater than 0, status should be A, D, or M, diff should not be empty' },
			{ lines: ['1000|m|content', '-1|-|content|extra'], message: 'invalid line "-1|-|content|extra" (2): line number should be greater than 0, status should be A, D, or M' },
			{ lines: ['999999|a|content', ''], message: 'unexpected empty line at line 2' },
			{ lines: [undefined], message: 'unexpected empty line at line 1' },
		])('creates a new instance with invalid lines', ({lines, message}) => {
			// Arrange
			const factory = new DiffCollectionFactory()

			// Act
			const create = () => factory.create(lines)

			// Assert
			expect(create).toThrow(message)
		})
	})

	describe('tryToSetSymbol', () => {
		it('sets the symbol for the line', () => {
			// Arrange
			const instance = createInstance(['1|A|line1', '2|A|line2'])

			// Act
			const result = instance.tryToSetSymbol(1, 'foo')

			// Assert
			expect(result).toBe(true)
			expect(instance.toJSON()).toContainEqual({ symbol: 'foo', line: 1, status: 'A', content: 'line1' })
		})

		it('does not set the symbol for the line if already set', () => {
			// Arrange
			const instance = createInstance(['1|m|line1', '2|m|line2'])
			instance.tryToSetSymbol(1, 'foo')

			// Act
			const result = instance.tryToSetSymbol(1, 'bar')

			// Assert
			expect(result).toBe(false)
			expect(instance.toJSON()).toContainEqual({ symbol: 'foo', line: 1, status: 'M', content: 'line1' })
		})

		it('does not set the symbol for the line if not found', () => {
			// Arrange
			const instance = createInstance(['1|A|line1', '2|A|line2'])

			// Act
			const result = instance.tryToSetSymbol(3, 'foo')

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('hasDiffInRange', () => {
		it('returns true if the range is within the diff', () => {
			// Arrange
			const instance = createInstance(['1|A|line1', '2|A|line2', '3|A|line3', '4|A|line4'])

			// Act
			const result = instance.hasDiffInRange(2, 3)

			// Assert
			expect(result).toBe(true)
		})

		it('returns true if the range is partially within the diff', () => {
			// Arrange
			const instance = createInstance(['2|A|line2', '4|A|line4', '5|A|line5'])

			// Act
			const result = instance.hasDiffInRange(3, 5)

			// Assert
			expect(result).toBe(true)
		})

		it('returns true if the range is the same as the diff', () => {
			// Arrange
			const instance = createInstance(['2|A|line2', '3|A|line3', '4|A|line4'])

			// Act
			const result = instance.hasDiffInRange(2, 4)

			// Assert
			expect(result).toBe(true)
		})

		it('returns false if the range is outside the diff', () => {
			// Arrange
			const instance = createInstance(['1|A|line1', '2|A|line2'])

			// Act
			const result = instance.hasDiffInRange(3, 4)

			// Assert
			expect(result).toBe(false)
		})

		it('returns false if the range is between two diffs', () => {
			// Arrange
			const instance = createInstance(['2|A|line2', '3|A|line3', '8|A|line8'])

			// Act
			const result = instance.hasDiffInRange(5, 7)

			// Assert
			expect(result).toBe(false)
		})

		it.each([
			{start: 1, end: 2},
			{start: 4, end: 6},
		])('returns true if the range partially overlaps the diff', ({start, end}) => {
			// Arrange
			const instance = createInstance(['2|A|line2', '3|A|line3', '4|A|line4'])

			// Act
			const result = instance.hasDiffInRange(start, end)

			// Assert
			expect(result).toBe(true)
		})

		it('returns true if the range is the same as the diff and the diff is a single line', () => {
			// Arrange
			const instance = createInstance(['2|A|line2'])

			// Act
			const result = instance.hasDiffInRange(2, 2)

			// Assert
			expect(result).toBe(true)
		})

		it('returns false if there is no diff', () => {
			// Arrange
			const instance = createInstance([])

			// Act
			const result = instance.hasDiffInRange(1, 1)

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('toJSON', () => {
		it('returns the diff as JSON', () => {
			// Arrange
			const instance = createInstance(['1|a|line1', '2|m|line2'])

			// Act
			const result = instance.toJSON()

			// Assert
			expect(result).toEqual([
				{ symbol: null, line: 1, status: 'A', content: 'line1' },
				{ symbol: null, line: 2, status: 'M', content: 'line2' },
			])
		})
	})
})