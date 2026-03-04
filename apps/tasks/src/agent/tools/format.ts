import { execFile } from 'node:child_process'
import path from 'node:path'

const ESLINT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
])

export const runEslintFix = async (filePath: string): Promise<void> => {
  const ext = path.extname(filePath)
  if (!ESLINT_EXTENSIONS.has(ext)) return

  try {
    await new Promise<void>((resolve, reject) => {
      execFile('npx', ['eslint', '--fix', filePath], { timeout: 15_000 }, (error) => {
        if (error && error.code !== 1) reject(error)
        else resolve()
      })
    })
  } catch {}
}
