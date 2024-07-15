#!/usr/bin/env node

import fs from 'node:fs/promises'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

const [path] = process.argv.slice(2)

const readDir = async (path: string) => {
  let size = 0
  const files = await fs.readdir(path)
  for (const file of files) {
    const filePath = `${path}${file}`
    try {
      const stat = await fs.lstat(filePath)
      if (stat.isDirectory()) {
        size += await readDir(`${filePath}/`)
      }
      if (stat.isFile()) {
        size += stat.size
      }
    } catch (e) {}
  }

  if (size > 10485760000) console.log(`${size}B\t${(size / 1073741824).toFixed(1)}GB\t${path}`)

  return size
}

const main = async (path: string) => {
  await readDir(path)
}

main(path).catch(console.error)
