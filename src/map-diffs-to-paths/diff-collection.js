export class DiffCollectionFactory {
	/**
	 * @param {string[]} lines 
	 */
	create(lines) {
		return new DiffCollection(lines)
	}
}

export default class DiffCollection {

	/** @type {Map<number, { line: string; symbol: string; status: string; content: string; }>} */
	#lines

	/** @type {number} */
	#firstLine

	/** @type {number} */
	#lastLine

	/**
	 * @param {string[]} lines 
	 */
	constructor(lines) {
		this.#lines = new Map()
		lines
			.map(line => {
				const [num, status, ...content] = line.split('|')
				return [parseInt(num, 10), status, content.join('|')]
			})
			.forEach(([line, status, content]) => {
				if (!this.#firstLine || line < this.#firstLine) {
					this.#firstLine = line
				}
				if (!this.#lastLine || line > this.#lastLine) {
					this.#lastLine = line
				}
				this.#lines.set(line, { symbol: null, line, status, content })
			})
	}

	/**
	 * @returns {{ start: number; end: number; }}
	 */
	getRange() {
		return { start: this.#firstLine, end: this.#lastLine }
	}

	/**
	 * @param {number} line 
	 * @param {string} symbol 
	 * @returns {boolean} True if the symbol was set, false otherwise
	 */
	tryToSetSymbol(line, symbol) {
		const diff = this.#lines.get(line)
		if (diff && !diff.symbol) {
			diff.symbol = symbol
			return true
		}
		return false
	}

	/**
	 * @param {number} line 
	 * @returns {boolean} True if the line is new, false otherwise
	 */
	isNewLine(line) {
		const diff = this.#lines.get(line)
		return diff && diff.status === 'A'
	}

	/**
	 * @param {number} startLine 
	 * @param {number} endLine 
	 * @returns {boolean}
	 */
	hasDiffInRange(startLine, endLine) {
		// if the range is outside of the diff lines, return false
		if (endLine < this.#firstLine || startLine > this.#lastLine) {
			return false
		}

		for (let line = startLine; line <= endLine; line++) {
			if (this.#lines.has(line)) {
				return true
			}
		}
		return false
	}

	toJSON() {
		return Array.from(this.#lines.values())
	}
}