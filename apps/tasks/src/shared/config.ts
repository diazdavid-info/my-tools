import { createDir, homeDir, pathExists, processDir, readFile, writeFile } from './file-system'
import { contentConfig, Config } from './config-template'
import { base64Encode } from './encoder'

export const init = async () => {
  if (pathExists(`${homeDir()}/.mytools/config`)) return

  if (!pathExists(`${homeDir()}/.mytools`)) await createDir(`${homeDir()}/.mytools`)

  const data = JSON.stringify(contentConfig, null, 2)
  await writeFile(`${homeDir()}/.mytools/config`, data)
}

export const isJiraConfigured = async () => {
  const projectName = base64Encode(processDir())

  const fileContent = await readFile(`${homeDir()}/.mytools/config`)
  const config = JSON.parse(fileContent) as Config

  const generalConfig = config.tools.jira
  const projectConfig = config.projects[projectName]?.tools.jira

  console.log(config)
  console.log(generalConfig)
  console.log(projectConfig)

  if (projectConfig) return projectConfig.domain && projectConfig.authorization

  return generalConfig.domain && generalConfig.authorization
}

export const addCurrentProject = async () => {
  const projectName = base64Encode(processDir())

  const fileContent = await readFile(`${homeDir()}/.mytools/config`)
  const config = JSON.parse(fileContent) as Config

  const project = config.projects[projectName]

  if (!project) {
    const date = new Date()
    config.projects[projectName] = { tasks: [], createdAt: date.valueOf(), updatedAt: date.valueOf(), tools: {} }
    const data = JSON.stringify(config, null, 2)
    await writeFile(`${homeDir()}/.mytools/config`, data)
  }
}
