/**
 * @typedef {object} GetPathArgs
 * @property {string} file
 * @property {number} line
 * @property {boolean} [json]
 * @property {boolean} [minified]
 * @property {boolean} [plain]
 */

export default class GetPathCommand {
	static command = 'get-path'
	static describe = 'Get symbol path at line <line> in file at <file>.'

	/** @type {import('yargs').CommandBuilder} */
	static builder = {
		file: {
			alias: 'f',
			describe: 'Source file to load',
			demandOption: true,
			string: true,
		},
		line: {
			alias: 'l',
			describe: 'Line to get the symbol path for (1-based)',
			demandOption: true,
			number: true,
		},
		json: {
			alias: 'j',
			describe: 'Output the result as JSON',
			demandOption: false,
			boolean: true,
		},
		minified: {
			alias: 'm',
			describe: 'Output the result as minified JSON',
			implies: 'json',
			demandOption: false,
			boolean: true,
		},
		plain: {
			alias: 'p',
			describe: 'Output the result as plain text',
			demandOption: false,
			boolean: true,
		},
	}

	/**
	 * @type {import('node:fs/promises')}
	 * Dependency injection for fs module
	 */
	#fs
	/**
	 * @type {import('../helpers/typescript-helper').default}
	 * Dependency injection for typescript-helper module
	 */
	#tsHelper

	/**
	 * @param {import('node:fs/promises')} fs Dependency injection for fs module
	 * @param {import('../helpers/typescript-helper').default} tsHelper Dependency injection for typescript-helper module
	 */
	constructor(fs, tsHelper) {
		this.#fs = fs
		this.#tsHelper = tsHelper
	}

	/**
	 * @param {import('yargs').ArgumentsCamelCase<GetPathArgs>} argv
	 * @returns {Promise<void>}
	 */
	async handler(argv) {
		const { file, line } = argv

		const content = await this.#fs.readFile(file, 'utf-8')

		const sourceFile = await this.#tsHelper.createSourceFile(file, content)

		const children = sourceFile.getChildren(sourceFile)	
		const matchingNode = this.#findNode(children, line)

		let path = ''
		if (matchingNode) {
			path = this.#tsHelper.getPath(matchingNode)
		}

		if (argv.json) {
			this.#outputJson({ file, line, path }, argv.minified)
		}
		else {
			this.#outputPlain(path)
		}
	}

	/**
	 * @private
	 * @param {{file: string; line: number; path: string;}} object 
	 * @param {boolean} minified 
	 */
	#outputJson(object, minified) {
		if (minified) {
			console.log(JSON.stringify(object))
		}
		else {
			console.log(JSON.stringify(object, null, 2))
		}
	}

	/**
	 * @private
	 * @param {string} path
	 */
	#outputPlain(path) {
		console.log(path)
	}

	/**
	 * @param {import('typescript').Node[]} nodes 
	 * @param {number} line 
	 * @returns {import('typescript').Node|undefined}
	 */
	#findNode(nodes, line) {
		for (const node of nodes) {
			// Try to find the node in the children
			const children = node.getChildren()
			const matchingNode = this.#findNode(children, line)
			if (matchingNode) {
				return matchingNode
			}

			// Otherwise check if the current node is the one we are looking for
			if (this.#tsHelper.isFunctionLikeDeclaration(node)) {
				if (this.#tsHelper.isInRange(node, line)) {
					return node
				}
			}
		}
		return undefined
	}
}