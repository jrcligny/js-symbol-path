/**
 * @typedef {import('node:path')} NodePathModule
 * @typedef {import('typescript')} TypescriptModule
 * @typedef {import('typescript').SourceFile} SourceFile
 * @typedef {import('typescript').ScriptKind} ScriptKind
 * @typedef {import('typescript').Node} TypescriptNode
 */

export default class TypescriptHelper {
	/**
	 * @type {NodePathModule}
	 * Dependency injection for node:path module
	 */
	#path
	/**
	 * @type {TypescriptModule}
	 * Dependency injection for typescript module
	 */
	#ts

	/**
	 * @param {NodePathModule} path Dependency injection for node:path module
	 * @param {TypescriptModule} ts Dependency injection for typescript module
	 */
	constructor(path, ts) {
		this.#path = path
		this.#ts = ts
	}

	//#region createSourceFile
	/**
	 * @param {string} filename
	 * @param {string} content
	 * @returns {Promise<SourceFile>}
	 */
	async createSourceFile(filename, content) {
		const scriptKind = this.#getScriptKind(filename)
		return this.#ts.createSourceFile(
			filename,
			content,
			this.#ts.ScriptTarget.Latest,
			/* setParentNodes */ true,
			scriptKind
		)
	}

	/**
	 * @private
	 * @param {string} filename 
	 * @returns {ScriptKind}
	 */
	#getScriptKind(filename) {
		const extname = this.#path.extname(filename).toLowerCase()
		switch (extname) {
		case '.ts':
		case '.cts':
		case '.mts':
			return this.#ts.ScriptKind.TS
		case '.tsx':
			return this.#ts.ScriptKind.TSX
		case '.js':
		case '.cjs':
		case '.mjs':
			return this.#ts.ScriptKind.JS
		case '.jsx':
			return this.#ts.ScriptKind.JSX
		default:
			return this.#ts.ScriptKind.Deferred
		}
	}
	//#endregion createSourceFile

	//#region getPath
	/**
	 * @param {TypescriptNode} node 
	 * @returns {string}
	 */
	getPath(node) {
		let path = ''
		let currentNode = node
		while (currentNode) {
			const name = this.#tryToGetName(currentNode)
			if (name) path = path ? `${name}.${path}` : name
			currentNode = currentNode.parent
		}
		return path
	}

	/**
	 * @private
	 * @param {TypescriptNode} node 
	 * @returns {string|undefined}
	 */
	#tryToGetName(node) {
		if (this.#ts.isConstructorDeclaration(node)) {
			return 'constructor'
		}
		if (!node.name) return undefined
		return node.name.getText()
	}
	//#endregion getPath

	//#region lineRange
	/**
	 * @param {TypescriptNode} node 
	 * @param {number} line 1-based line number
	 * @returns {boolean}
	 */
	isInRange(node, line) {
		if (line < 1) return false
		if(!node) throw new Error('invalid node')
		const { startLine, endLine } = this.getLineRange(node)
		return line >= startLine && line <= endLine
	}

	/**
	 * @param {TypescriptNode} node 
	 * @returns {{startLine: number, endLine: number}} 1-based line numbers
	 */
	getLineRange(node) {
		const startLine = this.#getLine(node, node.getStart())
		const endLine = this.#getLine(node, node.getEnd())
		return { startLine, endLine }
	}

	/**
	 * @private
	 * @param {TypescriptNode} node 
	 * @param {number} position 
	 * @returns {number} 1-based line number
	 */
	#getLine(node, position) {
		return this.#ts.getLineAndCharacterOfPosition(node.getSourceFile(), position).line + 1
	}
	//#endregion lineRange

	/**
	 * @param {TypescriptNode} node 
	 * @returns {boolean}
	 */
	isFunctionLikeDeclaration(node) {
		return this.#ts.isClassDeclaration(node)
				|| this.#ts.isFunctionDeclaration(node)
				|| this.#ts.isMethodDeclaration(node)
				|| this.#ts.isConstructorDeclaration(node)
	}
}