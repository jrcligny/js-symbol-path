/**
 * @typedef {object} MapDiffsToPathsArgs
 * @property {string} file
 * @property {string} diff-file
 * @property {boolean} [json]
 * @property {boolean} [minified]
 * @property {boolean} [plain]
 */

/**
 * @typedef {import('yargs').CommandBuilder} CommandBuilder
 * @typedef {import('yargs').ArgumentsCamelCase<MapDiffsToPathsArgs>} ExtendedMapDiffsToPathsArgs
 * @typedef {import('typescript').Node} TypescriptNode
 * @typedef {import('../helpers/file-system-helper').default} FileSystemHelper
 * @typedef {import('../helpers/typescript-helper').default} TypescriptHelper
 * @typedef {import('./diff-collection').DiffCollectionFactory} DiffCollectionFactory
 * @typedef {import('./diff-collection').default} DiffCollection
 */

export default class MapDiffsToPathsCommand {
	static command = 'map-diffs-to-paths'
	static describe = 'Based on <file>, get symbol path for each diff listed in <diff-file>. In <diff-file>, each line must be in the format "<line>|<content>".'

	/** @type {CommandBuilder} */
	static builder = {
		content: {
			position: 0,
			demandOption: false,
			string: true,
		},
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
	 * @type {FileSystemHelper}
	 * Dependency injection for file-system helper
	 */
	#fsHelper
	/**
	 * @type {TypescriptHelper}
	 * Dependency injection for typescript helper
	 */
	#tsHelper
	/**
	 * @type {DiffCollectionFactory}
	 * Dependency injection for diff-collection object
	 */
	#diffCollectionFactory

	/**
	 * @param {FileSystemHelper} fsHelper Dependency injection for file-system helper
	 * @param {TypescriptHelper} tsHelper Dependency injection for typescript helper
	 * @param {DiffCollectionFactory} diffCollectionFactory Dependency injection for diff-collection object
	 */
	constructor(fsHelper, tsHelper, diffCollectionFactory) {
		this.#fsHelper = fsHelper
		this.#tsHelper = tsHelper
		this.#diffCollectionFactory = diffCollectionFactory
	}

	/**
	 * @param {ExtendedMapDiffsToPathsArgs} argv
	 * @returns {Promise<void>}
	 */
	async handler(argv) {
		const { file, diffFile } = argv

		const content = await this.#fsHelper.readFile(file)
		const sourceFile = await this.#tsHelper.createSourceFile(file, content)

		const diffLines = await this.#fsHelper.readLines(diffFile)

		const diffCollection = this.#diffCollectionFactory.create(diffLines)

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
	 * @param {DiffCollection} diffCollection 
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
	 * @param {DiffCollection} diffCollection
	 */
	#outputPlain(diffCollection) {
		const json = diffCollection.toJSON()
		for (const { line, symbol, status, content } of json) {
			console.log(`${line}|${symbol??''}|${status}|${content}`)
		}
	}

	/**
	 * @param {TypescriptNode[]} nodes
	 * @returns {TypescriptNode|undefined}
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
