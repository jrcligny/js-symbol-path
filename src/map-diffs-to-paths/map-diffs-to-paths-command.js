/**
 * @typedef {object} GetDiffPathsArgs
 * @property {string} file
 * @property {string} diff-file
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
		}
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
	 * @param {import('yargs').ArgumentsCamelCase<GetDiffPathsArgs>} argv
	 * @returns {Promise<void>}
	 */
	async handler(argv) {
		const { file, "diff-file": diffLine } = argv

		const content = await this.#fs.readFile(file, 'utf-8')
		const sourceFile = await this.#tsHelper.createSourceFile(file, content)

		const diffContent = await this.#fs.readFile(diffLine, 'utf-8')

		const diffCollection = this.#diffCollectionFactory.create(diffContent.split('\n'))

		const children = sourceFile.getChildren(sourceFile)	
		this.#findNodes(children, diffCollection)

		console.log(JSON.stringify(diffCollection.toJSON()))
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
