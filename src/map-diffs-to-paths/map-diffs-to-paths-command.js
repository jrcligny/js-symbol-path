/**
 * @typedef {object} MapDiffsToPathsArgs
 * @property {string} file
 * @property {string} diff-file
 * @property {boolean} [json]
 * @property {boolean} [minified]
 * @property {boolean} [plain]
 */

export default class MapDiffsToPathsCommand {
	static command = 'map-diffs-to-paths'
	static describe = 'Based on <file>, get symbol path for each diff listed in <diff-file>. In <diff-file>, each line must be in the format "<line>|<content>".'

	/** @type {import('yargs').CommandBuilder} */
	static builder = {
		file: {
			alias: 'f',
			describe: 'Source file to load',
			demandOption: true,
			string: true,
		},
		'diff-file': {
			alias: 'd',
			describe: 'Diff file to load to get the diffs.',
			demandOption: true,
			string: true,
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
	 * @type {import('./diff-collection').DiffCollectionFactory}
	 * Dependency injection for diff-collection object
	 */
	#diffCollectionFactory

	/**
	 * @param {import('node:fs/promises')} fs Dependency injection for fs module
	 * @param {import('../helpers/typescript-helper').default} tsHelper Dependency injection for typescript-helper module
	 * @param {import('./diff-collection').DiffCollectionFactory} diffCollectionFactory Dependency injection for diff-collection object
	 */
	constructor(fs, tsHelper, diffCollectionFactory) {
		this.#fs = fs
		this.#tsHelper = tsHelper
		this.#diffCollectionFactory = diffCollectionFactory
	}

	/**
	 * @param {import('yargs').ArgumentsCamelCase<MapDiffsToPathsArgs>} argv
	 * @returns {Promise<void>}
	 */
	async handler(argv) {
		const { file, "diff-file": diffLine } = argv

		const content = await this.#fs.readFile(file, 'utf-8')
		const sourceFile = await this.#tsHelper.createSourceFile(file, content)

		const diffContent = await this.#fs.readFile(diffLine, 'utf-8')

		// @todo split lines according to the file's end of line character
		const diffCollection = this.#diffCollectionFactory.create(diffContent.split('\r\n'))

		const children = sourceFile.getChildren(sourceFile)
		this.#findNodes(children, diffCollection)

		if (argv.json) {
			this.#outputJson(diffCollection, argv.minified)
		}
		else {
			this.#outputPlain(diffCollection)
		}
	}

	/**
	 * @private
	 * @param {import('./diff-collection').default} diffCollection 
	 * @param {boolean} minified 
	 */
	#outputJson(diffCollection, minified) {
		const json = diffCollection.toJSON()
		if (minified) {
			console.log(JSON.stringify(json))
		}
		else {
			console.log(JSON.stringify(json, null, 2))
		}
	}

	/**
	 * @private
	 * @param {import('./diff-collection').default} diffCollection
	 */
	#outputPlain(diffCollection) {
		const json = diffCollection.toJSON()
		for (const { line, symbol, content } of json) {
			console.log(`${line}|${symbol??''}|${content}`)
		}
	}

	/**
	 * @param {import('typescript').Node[]} nodes
	 * @returns {import('typescript').Node|undefined}
	 */
	#findNodes(nodes, diffCollection) {
		for (const node of nodes) {
			// Check if the node is in the diff range, if not skip it
			const { startLine, endLine } = this.#tsHelper.getLineRange(node)
			if (!diffCollection.hasDiffInRange(startLine, endLine)) {
				continue
			}

			// Try to find the node in the children
			const children = node.getChildren()
			this.#findNodes(children, diffCollection)

			// Otherwise check if the current node is the one we are looking for
			if (this.#tsHelper.isFunctionLikeDeclaration(node)) {
				const path = this.#tsHelper.getPath(node)
				for (let line = startLine; line <= endLine; line++) {
					diffCollection.tryToSetSymbol(line, path)
				}
			}
		}
	}
}
