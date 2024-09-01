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
			const instance = factory.create(['3|line3', '1|line1', '2|line2', '8|line8', '7|line7'])

			// Assert
			expect(instance).toBeInstanceOf(DiffCollection)
			expect(instance.toJSON()).toEqual([
				{ symbol: null, line: 3, content: 'line3' },
				{ symbol: null, line: 1, content: 'line1' },
				{ symbol: null, line: 2, content: 'line2' },
				{ symbol: null, line: 8, content: 'line8' },
				{ symbol: null, line: 7, content: 'line7' },
			])
			expect(instance.getRange()).toEqual({ start: 1, end: 8 })
		})
	})

	describe('tryToSetSymbol', () => {
		it('sets the symbol for the line', () => {
			// Arrange
			const instance = createInstance(['1|line1', '2|line2'])

			// Act
			const result = instance.tryToSetSymbol(1, 'foo')

			// Assert
			expect(result).toBe(true)
			expect(instance.toJSON()).toContainEqual({ symbol: 'foo', line: 1, content: 'line1' })
		})

		it('does not set the symbol for the line if already set', () => {
			// Arrange
			const instance = createInstance(['1|line1', '2|line2'])
			instance.tryToSetSymbol(1, 'foo')

			// Act
			const result = instance.tryToSetSymbol(1, 'bar')

			// Assert
			expect(result).toBe(false)
			expect(instance.toJSON()).toContainEqual({ symbol: 'foo', line: 1, content: 'line1' })
		})

		it('does not set the symbol for the line if not found', () => {
			// Arrange
			const instance = createInstance(['1|line1', '2|line2'])

			// Act
			const result = instance.tryToSetSymbol(3, 'foo')

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('hasDiffInRange', () => {
		it('returns true if the range is within the diff', () => {
			// Arrange
			const instance = createInstance(['1|line1', '2|line2', '3|line3', '4|line4'])

			// Act
			const result = instance.hasDiffInRange(2, 3)

			// Assert
			expect(result).toBe(true)
		})

		it('returns true if the range is partially within the diff', () => {
			// Arrange
			const instance = createInstance(['2|line2', '4|line4', '5|line5'])

			// Act
			const result = instance.hasDiffInRange(3, 5)

			// Assert
			expect(result).toBe(true)
		})

		it('returns true if the range is the same as the diff', () => {
			// Arrange
			const instance = createInstance(['2|line2', '3|line3', '4|line4'])

			// Act
			const result = instance.hasDiffInRange(2, 4)

			// Assert
			expect(result).toBe(true)
		})

		it('returns false if the range is outside the diff', () => {
			// Arrange
			const instance = createInstance(['1|line1', '2|line2'])

			// Act
			const result = instance.hasDiffInRange(3, 4)

			// Assert
			expect(result).toBe(false)
		})

		it('returns false if the range is between two diffs', () => {
			// Arrange
			const instance = createInstance(['2|line2', '3|line3', '8|line8'])

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
			const instance = createInstance(['2|line2', '3|line3', '4|line4'])

			// Act
			const result = instance.hasDiffInRange(start, end)

			// Assert
			expect(result).toBe(true)
		})

		it('returns true if the range is the same as the diff and the diff is a single line', () => {
			// Arrange
			const instance = createInstance(['2|line2'])

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
			const instance = createInstance(['1|line1', '2|line2'])

			// Act
			const result = instance.toJSON()

			// Assert
			expect(result).toEqual([
				{ symbol: null, line: 1, content: 'line1' },
				{ symbol: null, line: 2, content: 'line2' },
			])
		})
	})
})