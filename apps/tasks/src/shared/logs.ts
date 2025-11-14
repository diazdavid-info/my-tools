import { cyan, green, red } from 'picocolors'
import { marked } from 'marked'
import TerminalRenderer from 'marked-terminal'

export const log = (message: string) =>
  console.log(`🐷  ${green('[SUCCESS]')} ${message}`)
export const logInfo = (message: string) =>
  console.log(`🐷  ${cyan('[INFO]')} ${message}`)
export const logError = (message: string) =>
  console.log(`🐷  ${red('[ERROR]')} ${message}`)

export const logMarkdown = async (message: string) => {
  marked.setOptions({
    renderer: new TerminalRenderer() as any,
  })
  console.log(`\n${await marked(message)}`)
}
