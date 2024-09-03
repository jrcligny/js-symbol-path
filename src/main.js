// external dependencies
import fs from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline/promises'
import ts from 'typescript'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
// internal dependencies
import GetPathCommand from './get-path/get-path-command'
import FileSystemHelper from './helpers/file-system-helper'
import TypescriptHelper from './helpers/typescript-helper'
import { DiffCollectionFactory } from './map-diffs-to-paths/diff-collection'
import MapDiffsToPathsCommand from './map-diffs-to-paths/map-diffs-to-paths-command'

const fsHelper = new FileSystemHelper(fs, readline)
const tsHelper = new TypescriptHelper(path, ts)
// set up the getPath command
const getPathCommandInstance = new GetPathCommand(fsHelper, tsHelper)
// set up the mapDiffsToPaths command
const diffCollectionFactory = new DiffCollectionFactory()
const mapDiffsToPathsCommandInstance = new MapDiffsToPathsCommand(fsHelper, tsHelper, diffCollectionFactory)

export default yargs(hideBin(process.argv))
	.usage('Usage: $0 <command> [options]')
	.command({
		command: GetPathCommand.command,
		describe: GetPathCommand.describe,
		builder: GetPathCommand.builder,
		handler: getPathCommandInstance.handler.bind(getPathCommandInstance),
	})
	.command({
		command: MapDiffsToPathsCommand.command,
		describe: MapDiffsToPathsCommand.describe,
		builder: MapDiffsToPathsCommand.builder,
		handler: mapDiffsToPathsCommandInstance.handler.bind(mapDiffsToPathsCommandInstance),
	})
	.demandCommand(1, 1, `choose a command: ${GetPathCommand.command} or ${MapDiffsToPathsCommand.command}`)
	.strict()
	.version('v')
	.alias('v', 'version')
	.help('h')
	.alias('h', 'help')
