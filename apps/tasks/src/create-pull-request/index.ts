import prompts from 'prompts'
import { cyan, green } from 'picocolors'
import { simpleGit } from 'simple-git'
import { getProjectList, Project, createPullRequest as githubCreatePullRequest, PullRequest } from './github-provider'
import open from 'open'

async function gitFetch() {
  console.log(`🐷  ${cyan('info')} making a git fetch...`)
  await simpleGit().fetch()
  console.log(`🐷  ${green('success')} git fetch completed`)
}

const askUserByBaseBranch = async (branchList: string[]) => {
  const { baseBranch } = await prompts({
    type: 'select',
    name: 'baseBranch',
    message: 'What base branch?',
    choices: branchList.map((branch) => ({ title: branch, value: branch }))
  })

  return baseBranch
}

const getBranchSummary = async (): Promise<[string, string[]]> => {
  const { current, all } = await simpleGit().branch()

  return [current, all]
}

const ensureTokenGithub = async () => {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_ORGANIZATION) {
    return Promise.reject('The envs GITHUB_TOKEN or GITHUB_ORGANIZATION not exist. More info in doc')
  }
}

const ensureCurrentBranchIsOrigin = async () => {
  const { current, all } = await simpleGit().branch()
  if (!all.find((branch) => branch === `remotes/origin/${current}`)) {
    return Promise.reject('Current branch not found at origin')
  }
}

const createPullRequest = async (
  currentBranch: string,
  baseBranch: string,
  projectSelected: string
): Promise<PullRequest> => {
  return await githubCreatePullRequest({
    title: `${currentBranch} pull request`,
    body: 'Esta PR [cierra, soluciona, resuelve] [#000](https://zityhub.atlassian.net/browse/000)\n\n![required gif]()\n\n### Descripción\n\n- Sobre Esta PR\n\n### Aceptación\n\n- [ ] Hay que probar....\n\n### Información extra\n\n- Más info\n\n',
    head: currentBranch,
    base: baseBranch,
    repo: projectSelected
  })
}

function excludeLocalBranches(allBranch: string[]) {
  const prefixRemoteBranch = 'remotes/origin/'

  return allBranch
    .filter((branchName) => branchName.includes(prefixRemoteBranch))
    .map((branchName) => branchName.replace(prefixRemoteBranch, ''))
}

const excludeCurrentBranch = (currentBranch: string, originBranches: string[]) => {
  return originBranches.filter((branchName) => branchName !== currentBranch)
}

const askUserByProject = async (projects: Project[]) => {
  const { project } = await prompts({
    type: 'select',
    name: 'project',
    message: 'What project?',
    choices: projects.map(({ name }) => ({ title: name, value: name }))
  })

  return project
}

const askUserByAllDataIsCorrect = async (
  projectSelected: string,
  baseBranch: string,
  currentBranch: string
): Promise<boolean> => {
  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: `Do you want to create PR in "${projectSelected}" from "${currentBranch}" to "${baseBranch}"?`
  })

  return confirmed
}

const run = async () => {
  await ensureTokenGithub()
  await gitFetch()
  await ensureCurrentBranchIsOrigin()

  const projects = await getProjectList()
  const projectSelected = await askUserByProject(projects)
  const [currentBranch, allBranch] = await getBranchSummary()
  const originBranches = excludeLocalBranches(allBranch)
  const baseBranches = excludeCurrentBranch(currentBranch, originBranches)
  const baseBranch = await askUserByBaseBranch(baseBranches)
  const confirmed = await askUserByAllDataIsCorrect(projectSelected, baseBranch, currentBranch)

  if (confirmed) {
    const { url } = await createPullRequest(currentBranch, baseBranch, projectSelected)

    await open(url)
  }
}

export default run
