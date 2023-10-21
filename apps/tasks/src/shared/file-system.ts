import os from 'node:os'
import { mkdir, writeFile as fsWriteFile, readFile as fsReadFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export const homeDir = (): string => {
  return os.homedir()
}

export const processDir = (): string => {
  return process.cwd()
}

export const createDir = async (path: string): Promise<void> => {
  await mkdir(path, { recursive: true })
}

export const pathExists = (path: string): boolean => {
  return existsSync(path)
}

export const writeFile = async (path: string, data: string): Promise<void> => {
  await fsWriteFile(path, data)
}

export const readFile = async (path: string) => {
  const buffer = await fsReadFile(path)
  return buffer.toString()
}
