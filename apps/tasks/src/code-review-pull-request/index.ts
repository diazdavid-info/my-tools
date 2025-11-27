import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { simpleGit } from 'simple-git'
import { aiConfig } from '../shared/config'
import { log, logInfo } from '../shared/logs'
import prompts from 'prompts'
import {
  createIssueComment,
  getProjectList,
  getPullRequest,
  Project,
  PullRequest,
} from '../create-pull-request/github-provider'
import { codeReview } from '../shared/system-prompts'

const ensureTokenGithub = async () => {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_ORGANIZATION) {
    return Promise.reject(
      'The envs GITHUB_TOKEN or GITHUB_ORGANIZATION not exist. More info in doc'
    )
  }
}

async function gitFetch() {
  logInfo('making a git fetch...')
  await simpleGit().fetch()
  log('git fetch completed')
}

const askUserByProject = async (projects: Project[]): Promise<string> => {
  const { project } = await prompts({
    type: 'select',
    name: 'project',
    message: 'What project?',
    choices: projects.map(({ name }) => ({ title: name, value: name })),
  })

  return project
}

const generateDiff = async (
  baseBranch: string,
  headBranch: string
): Promise<string | null> => {
  return simpleGit().diff([
    `${baseBranch}...${headBranch}`,
    '--unified=0',
    '--ignore-all-space',
    '--ignore-blank-lines',
    '--',
    ':!*.lock',
    ':!dist',
    ':!coverage',
  ])
}

const askUserByPullRequest = async (pullRequests: PullRequest[]) => {
  const { pullRequestId } = await prompts({
    type: 'select',
    name: 'pullRequestId',
    message: 'What pull request?',
    choices: pullRequests.map((pullRequest) => ({
      title: pullRequest.title,
      value: pullRequest.id,
    })),
  })

  return pullRequests.find((pullRequest) => pullRequest.id === pullRequestId)
}

const callAI = async (diff: string) => {
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

  return text
}

const run = async () => {
  await ensureTokenGithub()
  await gitFetch()
  const projects = await getProjectList()
  const projectSelected = await askUserByProject(projects)
  const pullRequests = await getPullRequest(projectSelected)
  const prSelected = await askUserByPullRequest(pullRequests)
  if (!prSelected) return
  const diff = await generateDiff(prSelected.baseSha, prSelected.headSha)
  if (!diff) return
  const reviewComment = await callAI(diff)
  await createIssueComment(
    projectSelected,
    prSelected.number,
    `### Esta review esta generada por IA y todavía está en fase de testing, no hacerle mucho caso\n\n${reviewComment}`
  )
}

export default run
