#!/usr/bin/env node

import fs from 'node:fs/promises'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

const [path, limitSize = '10'] = process.argv.slice(2)

const ONE_GB = 1_073_741_824

const readDir = async (path: string, limitSize: number) => {
  let size = 0
  const files = await fs.readdir(path)
  for (const file of files) {
    const filePath = `${path}${file}`
    try {
      const stat = await fs.lstat(filePath)
      if (stat.isDirectory()) {
        size += await readDir(`${filePath}/`, limitSize)
      }
      if (stat.isFile()) {
        size += stat.size
      }
    } catch (e) {}
  }

  if (size >= limitSize) console.log(`${size}B\t${(size / ONE_GB).toFixed(1)}GB\t${path}`)

  return size
}

const main = async (path: string) => {
  await readDir(path, parseInt(limitSize) * ONE_GB)
}

main(path).catch(console.error)
