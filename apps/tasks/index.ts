#!/usr/bin/env node

import prompts from 'prompts'
import createTask from './src/create-task'
import createPullRequest from './src/create-pull-request'
import {
  init as configInit,
  ensureFormatConfigFile,
  isExperimentalMode,
  isNewVersion,
  updateVersion,
  hasConfig,
  removeAllProjects,
} from './src/shared/config'
import runIA from './src/ia'
import runCommit from './src/commit'
import runCodeReview from './src/code-review'
import runCodeReviewPullRequest from './src/code-review-pull-request'
import { log, logError } from './src/shared/logs'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

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
  {
    title: '[IA] Code review assistant',
    value: 'ia-code-review-assistant',
    isExperimental: true,
    fn: runCodeReview,
  },
  {
    title: '[IA] Pull Request code review assistant',
    value: 'ia-pull-request-code-review-assistant',
    isExperimental: true,
    fn: runCodeReviewPullRequest,
  },
  { title: 'Exit', value: 'exit', isExperimental: false, fn: async () => {} },
] as const

const install = async () => {
  if (hasConfig() && !(await isNewVersion())) return
  await configInit()
  await ensureFormatConfigFile()
  await removeAllProjects() //0.17.8
  log(`new version detected`)
  await updateVersion()
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
    log(`process completed`)

    process.exit()
  })
  .catch((reason) => {
    logError(`aborting`)
    logError(`${reason}`)

    process.exit(1)
  })
