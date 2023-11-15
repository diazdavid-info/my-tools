import { createDir, homeDir, pathExists, processDir, readFile, writeFile } from './file-system'
import { Config, ConfigTaskStatus, contentConfig } from './config-template'
import { base64Encode } from './encoder'
import { Task } from './task'

export const init = async () => {
  if (pathExists(`${homeDir()}/.mytools/config`)) return

  if (!pathExists(`${homeDir()}/.mytools`)) await createDir(`${homeDir()}/.mytools`)

  await writeConfig(contentConfig)
}

export const ensureFormatConfigFile = async () => {
  const config = await readConfig()

  await writeConfig({ ...contentConfig, ...config })
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

export const removeTask = async (task: Task) => {
  await addCurrentProject()

  const projectName = base64Encode(processDir())

  const config = await readConfig()

  const project = config.projects[projectName]

  const tasks = project.tasks

  project.tasks = tasks.filter((t) => t.jiraId !== task.id)

  await writeConfig(config)
}

export const isDebugMode = async () => {
  const { debug } = await readConfig()
  return debug
}

export const isExperimentalMode = async () => {
  const { experimental } = await readConfig()
  return experimental
}

export const getInProgressTasks = async () => {
  const projectName = base64Encode(processDir())

  const config = await readConfig()

  const project = config.projects[projectName]

  if (!project) return []

  return project.tasks
}

const readConfig = async () => {
  const fileContent = await readFile(`${homeDir()}/.mytools/config`)
  return JSON.parse(fileContent) as Config
}

const writeConfig = async (config: Config) => {
  const data = JSON.stringify(config, null, 2)
  await writeFile(`${homeDir()}/.mytools/config`, data)
}
