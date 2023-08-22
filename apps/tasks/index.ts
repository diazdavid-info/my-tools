#!/usr/bin/env node

import prompts, { Choice } from 'prompts'
import { simpleGit } from 'simple-git'
import { cyan, red } from 'picocolors'
import { searchInProgressTasks } from './jira-provider'

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

async function ensureEnvs() {
  if (!process.env.JIRA_DOMAIN || !process.env.JIRA_AUTHORIZATION) {
    console.log(process.env)
    return Promise.reject('The envs JIRA_DOMAIN or JIRA_AUTHORIZATION not exist. More info in doc')
  }
}

async function createBranch(): Promise<void> {
  console.log(`🐷  ${cyan('info')} making a git fetch`)
  await simpleGit().fetch()
  console.log(`🐷  ${cyan('info')} git fetch completed`)

  console.log(`🐷  ${cyan('info')} requesting task in progress`)

  const issues = await searchInProgressTasks()

  const choices: Choice[] = []
  issues.forEach((issue) => {
    const taskDescription = `${issue.id}; ${issue.name}; ${issue.type}; ${issue.url}`
    choices.push({ title: taskDescription, value: taskDescription })
  })

  const { task } = await prompts({
    type: 'select',
    name: 'task',
    message: 'What task do you want to start?',
    choices,
    initial: 1
  })

  console.log(task)
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

  if (task === 'Create branch') await createBranch()
}

run()
  .then(() => {
    console.log(`🐷  ${cyan('info')} process completed`)

    process.exit()
  })
  .catch((reason) => {
    console.log(`🐷  ${red('error')} aborting`)
    console.log(`🐷  ${red('error')} ${reason}`)

    process.exit(1)
  })
