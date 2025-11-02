#!/usr/bin/env node

import prompts from 'prompts'
import { green, red } from 'picocolors'
import createTask from './src/create-task'
import createPullRequest from './src/create-pull-request'
import {
  init as configInit,
  ensureFormatConfigFile,
  isExperimentalMode,
  isNewVersion,
  updateVersion,
  hasConfig,
} from './src/shared/config'
import runIA from './src/ia'
import runCommit from './src/commit'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

const NEW_VERSION = '0.12.2'

const options = [
  {
    title: 'Create branch',
    value: 'create-branch',
    isExperimental: false,
    fn: createTask,
  },
  {
    title: 'Create PR',
    value: 'create-pull-request',
    isExperimental: false,
    fn: createPullRequest,
  },
  {
    title: '[IA] Check name test',
    value: 'ia-check-name-test',
    isExperimental: true,
    fn: runIA,
  },
  {
    title: '[IA] Generate title commit',
    value: 'ia-generate-title-commit',
    isExperimental: true,
    fn: runCommit,
  },
  { title: 'Exit', value: 'exit', isExperimental: false, fn: async () => {} },
] as const

const install = async () => {
  if (hasConfig() && !(await isNewVersion(NEW_VERSION))) return
  await configInit()
  await ensureFormatConfigFile()
  console.log(`🐷  ${green('success')} new version detected`)
  await updateVersion(NEW_VERSION)
}

const assUserByOption = async (): Promise<string> => {
  const isEnabledExperimental = await isExperimentalMode()
  const choices = options
    .filter(({ isExperimental }) => isEnabledExperimental || !isExperimental)
    .map(({ title, value }) => ({ title, description: '', value }))

  const { task } = await prompts({
    type: 'select',
    name: 'task',
    message: 'What do you want to do?',
    choices,
    initial: 0,
  })

  return task
}

const executeOption = async (task: string) => {
  const option = options.find(({ value }) => value === task)
  if (!option) throw new Error(`Unknown task: ${task}`)
  await option.fn()
}

const run = async (): Promise<void> => {
  await install()
  const task = await assUserByOption()
  await executeOption(task)
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
