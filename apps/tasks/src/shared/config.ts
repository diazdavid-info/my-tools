import {
  createDir,
  homeDir,
  pathExists,
  processDir,
  readFile,
  writeFile,
} from './file-system'
import { Config, contentConfig } from './config-template'
import { base64Encode } from './encoder'
import { logInfo } from './logs'

export const hasConfig = () => {
  return pathExists(`${homeDir()}/.mytools/config`)
}

export const init = async () => {
  if (pathExists(`${homeDir()}/.mytools/config`)) return

  if (!pathExists(`${homeDir()}/.mytools`))
    await createDir(`${homeDir()}/.mytools`)

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

export const isExperimentalMode = async () => {
  const { experimental } = await readConfig()
  return experimental
}

export const isNewVersion = async (newVersion: string) => {
  const [newMajor, newMinor, newPatch] = newVersion
    .split('.')
    .map((v) => parseInt(v))
  const { version } = await readConfig()
  if (!version) return true
  const { version: versionPackage } = await readPackage()
  logInfo(`Package current version: ${versionPackage}`)
  const [currentMajor, currentMinor, currentPatch] = version
    .split('.')
    .map((v) => parseInt(v))

  return (
    newMajor > currentMajor ||
    newMinor > currentMinor ||
    newPatch > currentPatch
  )
}

export const updateVersion = async (newVersion: string) => {
  const config = await readConfig()
  await writeConfig({ ...config, version: newVersion })
}

const readPackage = async () => {
  const fileContent = await readFile(`${__dirname}/../package.json`)
  return JSON.parse(fileContent)
}

const readConfig = async () => {
  const fileContent = await readFile(`${homeDir()}/.mytools/config`)
  return JSON.parse(fileContent) as Config
}

const writeConfig = async (config: Config) => {
  const data = JSON.stringify(config, null, 2)
  await writeFile(`${homeDir()}/.mytools/config`, data)
}
