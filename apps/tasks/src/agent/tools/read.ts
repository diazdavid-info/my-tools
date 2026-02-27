import fs from 'node:fs/promises'
import { tool } from 'ai'
import z from 'zod'
import { formatError, resolveSafePath, truncateIfNeeded } from './helper'

const formatFileContent = (
  content: string,
  offset: number,
  limit?: number
): string => {
  const lines = content.split('\n')

  const safeOffset = Math.max(1, offset)
  const startIndex = safeOffset - 1
  const endIndex =
    limit !== undefined ? startIndex + Math.max(0, limit) : lines.length

  return lines
    .slice(startIndex, endIndex)
    .map((line, index) => `${String(safeOffset + index).padStart(6)}  ${line}`)
    .join('\n')
}

export const execute = async (
  filePath: string,
  offset?: number,
  limit?: number
) => {
  try {
    const fullPath = resolveSafePath(filePath)
    const content = await fs.readFile(fullPath, 'utf-8')

    const formatted = formatFileContent(content, offset ?? 1, limit)

    return truncateIfNeeded(formatted)
  } catch (error) {
    return formatError(error)
  }
}

export const definition = {
  read: tool({
    description:
      'Read the contents of a file. Path must be relative to the project directory. Always read a file before editing it to understand its contents and conventions. For large files, use offset and limit to read specific sections.',
    inputSchema: z.object({
      file_path: z
        .string()
        .describe(
          "Relative path to the file (e.g. 'package.json', 'src/index.ts')"
        ),
      offset: z
        .number()
        .optional()
        .describe('Line number to start reading from (1-based). Optional.'),
      limit: z
        .number()
        .optional()
        .describe(
          'Maximum number of lines to read. Optional, defaults to entire file.'
        ),
    }),
    outputSchema: z.string(),
  }),
}
