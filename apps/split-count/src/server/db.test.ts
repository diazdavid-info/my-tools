import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { getDbPath } from './db'

const originalDbPath = process.env.DB_PATH
const temporaryDirectories: string[] = []

afterEach(() => {
  if (originalDbPath === undefined) delete process.env.DB_PATH
  else process.env.DB_PATH = originalDbPath

  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('getDbPath', () => {
  it('uses DB_PATH as a file path', () => {
    process.env.DB_PATH = '.split-count-data/custom.db'
    expect(getDbPath()).toBe(resolve('.split-count-data/custom.db'))
  })

  it('adds bote.db when DB_PATH points to a directory', () => {
    const directory = mkdtempSync(join(tmpdir(), 'split-count-'))
    temporaryDirectories.push(directory)
    process.env.DB_PATH = directory

    expect(getDbPath()).toBe(join(directory, 'bote.db'))
  })
})
