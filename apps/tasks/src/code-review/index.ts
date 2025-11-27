import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { simpleGit } from 'simple-git'
import { aiConfig } from '../shared/config'
import { log, logInfo, logMarkdown } from '../shared/logs'
import prompts from 'prompts'
import { codeReview } from '../shared/system-prompts'

async function gitFetch() {
  logInfo('making a git fetch...')
  await simpleGit().fetch()
  log('git fetch completed')
}

const getRemoteBranches = async (): Promise<string[]> => {
  return (await simpleGit().branch(['-r'])).all
}

const askUserByBaseBranch = async (branchList: string[]) => {
  const { baseBranch } = await prompts({
    type: 'select',
    name: 'baseBranch',
    message: 'What base branch?',
    choices: branchList.map((branch) => ({ title: branch, value: branch })),
  })

  return baseBranch
}

const generateDiff = async (baseBranch: string): Promise<string | null> => {
  return simpleGit().diff([
    `${baseBranch}...HEAD`,
    '--unified=0',
    '--ignore-all-space',
    '--ignore-blank-lines',
    '--',
    ':!*.lock',
    ':!dist',
    ':!coverage',
  ])
}

const callAI = async (diff: string | null) => {
  const { url, token, bigModel } = await aiConfig()
  const openai = createOpenAI({
    baseURL: url,
    apiKey: token,
  })

  const { text } = await generateText({
    model: openai(bigModel),
    system: codeReview,
    messages: [
      {
        role: 'user',
        content: `Analiza este diff y dame un code review útil y conciso:\n\n${diff}`,
      },
    ],
    temperature: 0.1,
  })

  await logMarkdown(text)
}

const run = async () => {
  await gitFetch()
  const remoteBranches = await getRemoteBranches()
  const baseBranch = await askUserByBaseBranch(remoteBranches)
  const diff = await generateDiff(baseBranch)
  await callAI(diff)
}

export default run
