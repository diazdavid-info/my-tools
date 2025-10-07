#!/usr/bin/env node

import prompts from 'prompts'
import { green, red } from 'picocolors'
import createTask from './src/create-task'
import createPullRequest from './src/create-pull-request'
import {
  init as configInit,
  ensureFormatConfigFile,
  isExperimentalMode,
  getInProgressTasks,
  isNewVersion,
  updateVersion,
  hasConfig
} from './src/shared/config'
import checkInProgressTasks from './src/check-in-progress-tasks'
import runServer from './src/run-server'
import runIA from './src/ia'
import runCommit from './src/commit'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

const NEW_VERSION = '0.12.2'

const install = async () => {
  if (hasConfig() && !(await isNewVersion(NEW_VERSION))) return
  await configInit()
  await ensureFormatConfigFile()
  console.log(`🐷  ${green('success')} new version detected`)
  await updateVersion(NEW_VERSION)
}

const assUserByOption = async (): Promise<string> => {
  const choices = [
    { title: 'Create branch', description: '', value: 'Create branch' },
    { title: 'Create PR', description: '', value: 'Create PR' },
    { title: 'Exit', description: '', value: 'Exit' }
  ]

  if (await isExperimentalMode()) {
    const lengthInProgressTasks = (await getInProgressTasks()).length
    choices.push(
      {
        title: `Check ${lengthInProgressTasks} in progress tasks`,
        description: '',
        value: 'Check in progress tasks'
      },
      {
        title: `Run server`,
        description: '',
        value: 'Run server'
      },
      {
        title: `IA`,
        description: '',
        value: 'IA'
      },
      {
        title: `Commit`,
        description: '',
        value: 'Commit'
      }
    )
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
  if (task === 'Run server') await runServer()
  if (task === 'IA') await runIA()
  if (task === 'Commit') await runCommit()
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
