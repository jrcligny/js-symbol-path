import * as esbuild from 'esbuild'

await esbuild.build({
	entryPoints: ['src/index.js'],
	bundle: true,
	platform: 'node',
	target: 'node20',
	sourcemap: true,
	allowOverwrite: true,
	format: 'cjs',
	outfile: 'dist/index.cjs',
})