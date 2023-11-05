import { createDir, homeDir, pathExists, processDir, readFile, writeFile } from './file-system'
import { Config, ConfigTaskStatus, contentConfig } from './config-template'
import { base64Encode } from './encoder'
import { Task } from '../create-task/jira-provider'

export const init = async () => {
  if (pathExists(`${homeDir()}/.mytools/config`)) return

  if (!pathExists(`${homeDir()}/.mytools`)) await createDir(`${homeDir()}/.mytools`)

  await writeConfig(contentConfig)
}

export const isJiraConfigured = async () => {
  const projectName = base64Encode(processDir())

  const config = await readConfig()

  const generalConfig = config.tools.jira
  const projectConfig = config.projects[projectName]?.tools.jira

  if (projectConfig) return projectConfig.domain && projectConfig.authorization

  return generalConfig.domain && generalConfig.authorization
}

export const addCurrentProject = async () => {
  const projectName = base64Encode(processDir())

  const config = await readConfig()

  const project = config.projects[projectName]

  if (!project) {
    const date = new Date()
    config.projects[projectName] = { tasks: [], createdAt: date.valueOf(), updatedAt: date.valueOf(), tools: {} }
    await writeConfig(config)
  }
}

export const addTask = async (task: Task) => {
  await addCurrentProject()

  const projectName = base64Encode(processDir())

  const config = await readConfig()

  const project = config.projects[projectName]

  const date = new Date()

  project.tasks.push({
    jiraId: task.id,
    jiraName: task.name,
    jiraType: task.type,
    jiraUrl: task.url,
    status: ConfigTaskStatus.IN_PROGRESS,
    createdAt: date.valueOf(),
    updatedAt: date.valueOf()
  })

  await writeConfig(config)
}

export const isDebugMode = async () => {
  const { debug } = await readConfig()
  return debug
}

const readConfig = async () => {
  const fileContent = await readFile(`${homeDir()}/.mytools/config`)
  return JSON.parse(fileContent) as Config
}

const writeConfig = async (config: Config) => {
  const data = JSON.stringify(config, null, 2)
  await writeFile(`${homeDir()}/.mytools/config`, data)
}