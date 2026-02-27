import fg from 'fast-glob'
import { tool } from 'ai'
import z from 'zod'

export const execute = async (pattern: string) => {
  const matches = await fg(pattern, {
    cwd: process.cwd(),
    onlyFiles: false,
    ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**', 'build/**'],
    deep: 8,
  })
  const limited = matches.slice(0, 200)
  const suffix =
    matches.length > 200 ? `\n... (${matches.length - 200} more)` : ''
  return limited.join('\n') + suffix || '(no results)'
}

export const definition = {
  glob: tool({
    description:
      "Find files matching a glob pattern. Use this to explore the project structure, find specific file types, or locate files by name. Returns matching file paths. Examples: '**/*.ts', 'src/**/*.tsx', '**/package.json'",
    inputSchema: z.object({
      pattern: z
        .string()
        .describe("Glob pattern to match files (e.g. '**/*.ts', 'src/**/*')"),
    }),
  }),
}
