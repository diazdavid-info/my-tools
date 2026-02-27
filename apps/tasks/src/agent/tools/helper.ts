import path from 'node:path'

const MAX_OUTPUT_LENGTH = 30_000
const ROOT_PATH = process.cwd()

export const formatError = (error: unknown): string =>
  error instanceof Error ? `ERROR: ${error.message}` : 'ERROR: Unknown error'

export const resolveSafePath = (filePath: string): string => {
  const fullPath = path.resolve(ROOT_PATH, filePath)

  if (!fullPath.startsWith(path.resolve(ROOT_PATH))) {
    throw new Error('Invalid file path')
  }

  return fullPath
}

export const truncateIfNeeded = (
  text: string,
  maxLength: number = MAX_OUTPUT_LENGTH
): string =>
  text.length > maxLength
    ? text.slice(0, maxLength) + '\n... (truncated, file too large)'
    : text
