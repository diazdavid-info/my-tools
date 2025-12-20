// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'node18',
  bundle: true,
  clean: true,
  minify: true,
})
