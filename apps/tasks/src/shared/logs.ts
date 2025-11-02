import { cyan, green, red } from 'picocolors'

export const log = (message: string) =>
  console.log(`🐷  ${green('[SUCCESS]')} ${message}`)
export const logInfo = (message: string) =>
  console.log(`🐷  ${cyan('[INFO]')} ${message}`)
export const logError = (message: string) =>
  console.log(`🐷  ${red('[ERROR]')} ${message}`)
