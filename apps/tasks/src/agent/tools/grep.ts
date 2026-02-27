import { execFileSync } from 'node:child_process'
import { formatError, truncateIfNeeded } from './helper'
import { tool } from 'ai'
import z from 'zod'

type GrepMatch = {
  file: string
  line: number
  text: string
}

const MAX_GREP_RESULTS = 100
const MAX_LINE_LENGTH = 2000

const runRipgrep = (pattern: string, fileGlob?: string): string => {
  const args = buildRgArgs(pattern, fileGlob)

  return execFileSync('rg', args, {
    cwd: process.cwd(),
    timeout: 10_000,
    encoding: 'utf-8',
    maxBuffer: 20 * 1024 * 1024,
  })
}

const buildRgArgs = (pattern: string, fileGlob?: string): string[] => {
  const baseArgs = [
    '-nH',
    '--hidden',
    '--no-messages',
    '--field-match-separator=|',
    '--glob=!.git/*',
    '--glob=!node_modules/*',
    '--glob=!dist/*',
    '--glob=!build/*',
    '--glob=!.next/*',
    '--regexp',
    pattern,
  ]

  if (fileGlob) {
    baseArgs.push('--glob', fileGlob)
  }

  baseArgs.push('.')

  return baseArgs
}

const parseRgOutput = (output: string): GrepMatch[] => {
  return output
    .trim()
    .split(/\r?\n/)
    .flatMap((line): GrepMatch[] => {
      if (!line) return []

      const [file, lineStr, ...textParts] = line.split('|')
      const lineNum = Number(lineStr)

      if (
        !file ||
        !lineStr ||
        Number.isNaN(lineNum) ||
        textParts.length === 0
      ) {
        return []
      }

      return [
        {
          file,
          line: lineNum,
          text: truncateIfNeeded(textParts.join('|'), MAX_LINE_LENGTH),
        },
      ]
    })
}

const formatMatches = (matches: GrepMatch[]): string => {
  const truncated = matches.length > MAX_GREP_RESULTS
  const visible = truncated ? matches.slice(0, MAX_GREP_RESULTS) : matches

  const output: string[] = []

  output.push(
    `Found ${matches.length} matches${
      truncated ? ` (showing first ${MAX_GREP_RESULTS})` : ''
    }`
  )

  let currentFile: string | null = null

  for (const match of visible) {
    if (match.file !== currentFile) {
      if (currentFile !== null) output.push('')
      currentFile = match.file
      output.push(`${match.file}:`)
    }

    output.push(`  Line ${match.line}: ${match.text}`)
  }

  if (truncated) {
    output.push('')
    output.push(
      `(Results truncated: showing ${MAX_GREP_RESULTS} of ${matches.length} matches. Use a more specific pattern or file_glob.)`
    )
  }

  return output.join('\n')
}

export const execute = async (pattern: string, fileGlob?: string) => {
  try {
    const raw = runRipgrep(pattern, fileGlob)

    if (!raw.trim()) return '(no results)'

    const matches = parseRgOutput(raw)

    if (matches.length === 0) return '(no results)'

    return formatMatches(matches)
  } catch (error: any) {
    if (error?.status === 1) return '(no results)'

    return formatError(error)
  }
}

export const definition = {
  grep: tool({
    description:
      'Search for a regex pattern across project files. Returns matching lines with file path and line number. Use this to find function definitions, usages, imports, string occurrences, etc.',
    inputSchema: z.object({
      pattern: z
        .string()
        .describe('Regex pattern to search for in file contents'),
      file_glob: z
        .string()
        .optional()
        .describe(
          "Optional glob to filter which files to search (e.g. '*.ts', '*.tsx')"
        ),
    }),
    outputSchema: z.string(),
  }),
}
