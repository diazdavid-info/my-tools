import { tool } from 'ai'
import z from 'zod'
import { formatError, resolveSafePath } from './helper'
import { replace } from './replace'
import fs from 'node:fs/promises'
import { logTools } from '../../shared/logs'

export const execute = async (
  filePath: string,
  oldString: string,
  newString: string
) => {
  try {
    logTools(`[tool] edit(${filePath})`)

    const fullPath = resolveSafePath(filePath)

    const content = await fs.readFile(fullPath, 'utf-8')
    const updated = replace(content, oldString, newString)
    await fs.writeFile(fullPath, updated, 'utf-8')
    return `File edited: ${filePath}`
  } catch (e) {
    return formatError(e)
  }
}

export const definition = {
  edit: tool({
    description:
      'Replace a specific string in a file with new content. The old_string must match EXACTLY (including whitespace and indentation). If the string is not unique, provide more surrounding context to make it unique. Always read the file first before editing.',
    inputSchema: z.object({
      file_path: z.string().describe('Relative path to the file to edit'),
      old_string: z.string().describe('The exact string to find and replace'),
      new_string: z.string().describe('The replacement string'),
    }),
    outputSchema: z.string(),
  }),
}
