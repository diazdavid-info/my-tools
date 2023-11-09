#!/usr/bin/env node

import prompts from 'prompts'
import { green, red } from 'picocolors'
import createTask from './src/create-task'
import createPullRequest from './src/create-pull-request'
import { init as configInit, ensureFormatConfigFile } from './src/shared/config'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

const install = async () => {
  await configInit()
  await ensureFormatConfigFile()
}

const assUserByOption = async (): Promise<string> => {
  const { task } = await prompts({
    type: 'select',
    name: 'task',
    message: 'What do you want to do?',
    choices: [
      { title: 'Create branch', description: '', value: 'Create branch' },
      { title: 'Create PR', description: '', value: 'Create PR' },
      { title: 'Exit', description: '', value: 'Exit' }
    ],
    initial: 0
  })

  return task
}

const run = async (): Promise<void> => {
  await install()
  const task = await assUserByOption()

  if (task === 'Create branch') await createTask()
  if (task === 'Create PR') await createPullRequest()
}

run()
  .then(() => {
    console.log(`🐷  ${green('success')} process completed`)

    process.exit()
  })
  .catch((reason) => {
    console.log(`🐷  ${red('error')} aborting`)
    console.log(`🐷  ${red('error')} ${reason}`)

    process.exit(1)
  })
