import { cyan, green, yellow } from 'picocolors'
import { simpleGit } from 'simple-git'
import { searchInProgressTasks, Task, TaskOwnership } from './jira-provider'
import prompts from 'prompts'
import { formatBranchName } from './format-branch-name'

async function gitFetch() {
  console.log(`🐷  ${cyan('info')} making a git fetch...`)
  await simpleGit().fetch()
  console.log(`🐷  ${green('success')} git fetch completed`)
}

async function gitPull() {
  console.log(`🐷  ${cyan('info')} pulling branches...`)
  await simpleGit().pull()
  console.log(`🐷  ${green('success')} pull branches completed`)
}

async function searchTasks(ownership: TaskOwnership) {
  console.log(`🐷  ${cyan('info')} requesting task in progress...`)
  return await searchInProgressTasks(ownership)
}

async function askUserByTaskOwnership() {
  const { ownership } = await prompts({
    type: 'select',
    name: 'ownership',
    message: 'What kind of task do you want to search?',
    choices: [
      { title: 'My tasks', value: TaskOwnership.MY_TASKS },
      { title: 'All tasks', value: TaskOwnership.ALL }
    ],
    initial: 0
  })
  return ownership
}

async function askUserByTask(issues: Task[]) {
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
  return task
}

async function askUserByFormatBranch(formatBranch: string[]) {
  const { branchName } = await prompts({
    type: 'select',
    name: 'branchName',
    message: 'What name of brunch do you like?',
    choices: formatBranch.map((format) => ({ title: format, value: format }))
  })
  return branchName
}

async function checkoutBranch(branchName: string) {
  console.log(`🐷  ${cyan('info')} creating new branch ${yellow(branchName)}`)
  await simpleGit().checkoutLocalBranch(branchName)
}

const run = async () => {
  await gitFetch()
  await gitPull()

  const ownership = await askUserByTaskOwnership()
  const issues = await searchTasks(ownership)
  if (!issues.length) return Promise.reject('There are not in progress tasks')
  const task = await askUserByTask(issues)

  const formatBranch = formatBranchName(task)
  const branchName = await askUserByFormatBranch(formatBranch)

  await checkoutBranch(branchName)
}

export default run
