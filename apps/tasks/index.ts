#!/usr/bin/env node

import prompts from 'prompts'
import { simpleGit } from 'simple-git'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

async function createBranch(): Promise<void> {
  const response = await simpleGit().fetch()

  console.log(response)
}

async function run(): Promise<void> {
  const { task } = await prompts({
    type: 'select',
    name: 'task',
    message: 'What do you want to do?',
    choices: [{ title: 'Create branch', description: '', value: 'Create branch' }],
    initial: 0
  })

  if (task === 'Create branch') await createBranch()
}

run()
  .then(() => {
    console.log('ok')

    process.exit()
  })
  .catch(() => {
    console.log('Aborting')

    process.exit(1)
  })
