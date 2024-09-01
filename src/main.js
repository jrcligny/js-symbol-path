// external dependencies
import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
// internal dependencies
import GetPathCommand from './command/get-path-command'
import TypescriptHelper from './helpers/typescript-helper'

const tsHelper = new TypescriptHelper(path, ts)
const getPathCommandInstance = new GetPathCommand(fs, tsHelper)

export default yargs(hideBin(process.argv))
	.usage('Usage: $0 <command> [options]')
	.command({
		command: GetPathCommand.command,
		describe: GetPathCommand.describe,
		builder: GetPathCommand.builder,
		handler: getPathCommandInstance.handler.bind(getPathCommandInstance),
	})
	.demandCommand(1, 1, `choose a command: ${GetPathCommand.command}`)
	.strict()
	.version('v')
	.alias('v', 'version')
	.help('h')
	.alias('h', 'help')
