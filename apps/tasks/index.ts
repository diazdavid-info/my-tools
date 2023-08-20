#!/usr/bin/env node

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

async function run(): Promise<void> {}

run()
  .then(() => {
    console.log('ok')

    process.exit()
  })
  .catch(() => {
    console.log('Aborting')

    process.exit(1)
  })
