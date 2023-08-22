#!/usr/bin/env node

import prompts from 'prompts'
import { simpleGit } from 'simple-git'
import { cyan, green, yellow, red } from 'picocolors'
import { searchInProgressTasks } from './jira-provider'
import { formatBranchName } from './format-branch-name'

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
  console.log(`🐷  ${green('success')} git fetch completed`)

  console.log(`🐷  ${cyan('info')} requesting task in progress`)

  const issues = await searchInProgressTasks()

  const { task } = await prompts({
    type: 'select',
    name: 'task',
    message: 'What task do you want to start?',
    choices: issues.map((issue) => {
      const title = `${cyan(issue.id)} => ${issue.name} => ${yellow(issue.type)}`
      const value = `${issue.id};${issue.name};${issue.type}`
      return { title, value }
    })
  })

  const formatBranch = formatBranchName(task)

  const { branchName } = await prompts({
    type: 'select',
    name: 'branchName',
    message: 'What name of brunch do you like?',
    choices: formatBranch.map((format) => ({ title: format, value: format }))
  })

  console.log(branchName)
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
    console.log(`🐷  ${green('success')} process completed`)

    process.exit()
  })
  .catch((reason) => {
    console.log(`🐷  ${red('error')} aborting`)
    console.log(`🐷  ${red('error')} ${reason}`)

    process.exit(1)
  })
