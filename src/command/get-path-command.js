/**
 * @typedef {object} GetPathArgs
 * @property {string} file
 * @property {number} line
 */

export default class GetPathCommand {
	static command = 'get-path'
	static describe = 'get symbol path at line <line> in file at <file>'

	/** @type {import('yargs').CommandBuilder} */
	static builder = {
		file: {
			alias: 'f',
			describe: 'Load a file',
			demandOption: true,
			string: true,
		},
		line: {
			alias: 'l',
			describe: 'Line to get the symbol path for (1-based)',
			demandOption: true,
			number: true,
		}
	}

	/**
	 * @type {import('node:fs/promises')}
	 * Dependency injection for fs module
	 */
	#fs
	/**
	 * @type {import('../helpers/typescript-helper')}
	 * Dependency injection for typescript-helper module
	 */
	#tsHelper

	/**
	 * @param {import('node:fs/promises')} fs Dependency injection for fs module
	 * @param {import('../helpers/typescript-helper')} tsHelper Dependency injection for typescript-helper module
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

		if (matchingNode) {
			const path = this.#tsHelper.getPath(matchingNode)
			console.log(JSON.stringify({ file, line, path }))
		}
		else {
			console.log(JSON.stringify({ file, line, path: '' }))
		}
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