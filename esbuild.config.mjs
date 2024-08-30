import * as esbuild from 'esbuild'

await esbuild.build({
	entryPoints: ['src/main.js'],
	bundle: true,
	platform: 'node',
	target: 'node20',
	sourcemap: true,
	outdir: 'dist',
	allowOverwrite: true,
	format: 'esm',
})