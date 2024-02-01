import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './app/server.js',
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true
  },
  // plugins: [typescript(), commonjs(), terser()]
  external: ['node:http', 'express'],
  plugins: [typescript(), commonjs()]
}
