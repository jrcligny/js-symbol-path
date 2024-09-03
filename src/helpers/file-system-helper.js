/**
 * @typedef {import('node:fs/promises')} NodeFSModule
 * @typedef {import('node:readline/promises')} NodeReadlineModule
 */

export default class FileSystemHelper {
	/**
	 * @type {NodeFSModule}
	 * Dependency injection for node:fs/promises module
	 */
	#fs

	/**
	 * @type {NodeReadlineModule}
	 * Dependency injection for node:readline/promises module
	 */
	#readline

	/**
	 * @type {string}
	 * Preferred encoding for reading files
	 */
	#preferredEncoding = 'utf-8'

	/**
	 * @param {NodeFSModule} fs Dependency injection for node:fs/promises module
	 * @param {NodeReadlineModule} readline Dependency injection for node:readline/promises module
	 */
	constructor(fs, readline) {
		this.#fs = fs
		this.#readline = readline
	}

	/**
	 * @param {string} path 
	 * @returns {Promise<string>}
	 */
	async readFile(path) {
		return await this.#fs.readFile(path, this.#preferredEncoding)
	}

	/**
	 * @param {string} path 
	 * @returns {Promise<string[]>}
	 */
	async readLines(path) {
		const lines = []

		const fileHandle = await this.#fs.open(path, 'r')
		const readStream = fileHandle.createReadStream({
			encoding: this.#preferredEncoding,
			autoClose: true,
		})
		const rl = this.#readline.createInterface({
			input: readStream,
			crlfDelay: Infinity
		})

		for await (const line of rl) {
			lines.push(line)
		}

		return lines
	}
}