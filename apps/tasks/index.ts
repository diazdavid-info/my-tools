#!/usr/bin/env node

import prompts from 'prompts'
import { green, red } from 'picocolors'
import createTask from './src/create-task'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

async function ensureEnvs() {
  if (!process.env.JIRA_DOMAIN || !process.env.JIRA_AUTHORIZATION) {
    return Promise.reject('The envs JIRA_DOMAIN or JIRA_AUTHORIZATION not exist. More info in doc')
  }
}

async function run(): Promise<void> {
  await ensureEnvs()

  const { task } = await prompts({
    type: 'select',
    name: 'task',
    message: 'What do you want to do?',
    choices: [{ title: 'Create branch', description: '', value: 'Create branch' }],
    initial: 0
  })

  if (task === 'Create branch') await createTask()
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
