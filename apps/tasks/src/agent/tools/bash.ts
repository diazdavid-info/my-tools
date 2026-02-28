import { tool } from 'ai'
import z from 'zod'
import { execSync } from 'node:child_process'
import { logTools } from '../../shared/logs'

export const execute = async (command: string, timeout?: number) => {
  logTools(`[tool] bash(${command}, ${timeout})`)

  const safeTimeout = Math.min(timeout || 60000, 600000)

  try {
    const result = execSync(command, {
      cwd: process.cwd(),
      timeout: safeTimeout,
      encoding: 'utf-8',
      env: { ...process.env, PATH: process.env.PATH },
    })
    return result.slice(0, 20000) || '(command executed with no output)'
  } catch (e) {
    const { message } = e as Error
    const stderr = (e as any).stderr || message || ''
    const stdout = (e as any).stdout || ''

    return `ERROR (exit ${(e as any).status ?? 'unknown'}):\n${(stdout + '\n' + stderr).slice(0, 10000)}`
  }
}

export const definition = {
  bash: tool({
    description:
      'Execute a shell command in the project directory. Use for: git operations, running npm/pnpm scripts, builds, tests, linters, installing packages, and any terminal operation. Do NOT use for file reading (use read) or file writing (use write).',
    inputSchema: z.object({
      command: z.string().describe('Shell command to execute'),
      timeout: z
        .number()
        .optional()
        .describe(
          'Timeout in milliseconds. Default: 60000 (60s). Max: 600000 (10min).'
        ),
    }),
    outputSchema: z.string(),
  }),
}
