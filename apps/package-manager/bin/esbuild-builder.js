import * as esbuild from 'esbuild'

const response = await esbuild.build({
  entryPoints: ['index.ts'],
  color: true,
  bundle: true,
  minify: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outdir: 'dist'
})

console.log(response)
