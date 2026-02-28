import { tool } from 'ai'
import z from 'zod'
import { formatError, resolveSafePath } from './helper'
import fs from 'node:fs/promises'
import path from 'node:path'
import { logTools } from '../../shared/logs'

export const execute = async (filePath: string, content: string) => {
  logTools(`[tool] write(${filePath})`)

  try {
    const fullPath = resolveSafePath(filePath)

    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, content, 'utf-8')
    return `File written: ${filePath} (${content.length} bytes)`
  } catch (e) {
    return formatError(e)
  }
}

export const definition = {
  write: tool({
    description:
      "Write full content to a file. Creates the file if it doesn't exist, overwrites if it does. Creates parent directories automatically. Prefer edit over write for modifying existing files.",
    inputSchema: z.object({
      file_path: z.string().describe('Relative path where to write the file'),
      content: z.string().describe('Full content of the file'),
    }),
    outputSchema: z.string(),
  }),
}
