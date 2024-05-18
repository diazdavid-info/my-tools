#!/usr/bin/env node

import prompts from 'prompts'
import { green, red } from 'picocolors'
import createTask from './src/create-task'
import createPullRequest from './src/create-pull-request'
import { init as configInit, ensureFormatConfigFile, isExperimentalMode, getInProgressTasks, isNewVersion, updateVersion } from './src/shared/config'
import checkInProgressTasks from './src/check-in-progress-tasks'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

const NEW_VERSION = '0.12.0'

const install = async () => {
  await configInit()
  await ensureFormatConfigFile()
  if(await isNewVersion(NEW_VERSION)) {
    console.log(`🐷  ${green('success')} new version detected`)
    await updateVersion(NEW_VERSION)
  }
}

const assUserByOption = async (): Promise<string> => {
  const choices = [
    { title: 'Create branch', description: '', value: 'Create branch' },
    { title: 'Create PR', description: '', value: 'Create PR' },
    { title: 'Exit', description: '', value: 'Exit' }
  ]

  if (await isExperimentalMode()) {
    const lengthInProgressTasks = (await getInProgressTasks()).length
    choices.push({
      title: `Check ${lengthInProgressTasks} in progress tasks`,
      description: '',
      value: 'Check in progress tasks'
    })
  }

  const { task } = await prompts({
    type: 'select',
    name: 'task',
    message: 'What do you want to do?',
    choices,
    initial: 0
  })

  return task
}

const run = async (): Promise<void> => {
  await install()
  const task = await assUserByOption()

  if (task === 'Create branch') await createTask()
  if (task === 'Create PR') await createPullRequest()
  if (task === 'Check in progress tasks') await checkInProgressTasks()
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
