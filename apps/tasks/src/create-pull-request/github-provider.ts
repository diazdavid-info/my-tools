import fetch from 'node-fetch'

export type Project = {
  id: number
  name: string
}

type GithubProject = {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: Owner
  html_url: string
  description: string
  fork: boolean
  url: string
  forks_url: string
  keys_url: string
  collaborators_url: string
  teams_url: string
  hooks_url: string
  issue_events_url: string
  events_url: string
  assignees_url: string
  branches_url: string
  tags_url: string
  blobs_url: string
  git_tags_url: string
  git_refs_url: string
  trees_url: string
  statuses_url: string
  languages_url: string
  stargazers_url: string
  contributors_url: string
  subscribers_url: string
  subscription_url: string
  commits_url: string
  git_commits_url: string
  comments_url: string
  issue_comment_url: string
  contents_url: string
  compare_url: string
  merges_url: string
  archive_url: string
  downloads_url: string
  issues_url: string
  pulls_url: string
  milestones_url: string
  notifications_url: string
  labels_url: string
  releases_url: string
  deployments_url: string
  created_at: Date
  updated_at: Date
  pushed_at: Date
  git_url: string
  ssh_url: string
  clone_url: string
  svn_url: string
  homepage: string
  size: number
  stargazers_count: number
  watchers_count: number
  language: string
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  forks_count: number
  mirror_url: null
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: null
  allow_forking: boolean
  is_template: boolean
  web_commit_signoff_required: boolean
  topics: any[]
  visibility: string
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
  permissions: Permissions
  security_and_analysis: SecurityAndAnalysis
}

type Owner = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

type Permissions = {
  admin: boolean
  maintain: boolean
  push: boolean
  triage: boolean
  pull: boolean
}

type SecurityAndAnalysis = {
  secret_scanning: string[]
  secret_scanning_push_protection: string[]
  dependabot_security_updates: string[]
}

type GithubPullRequest = {
  url: string
  id: number
  node_id: string
  html_url: string
  diff_url: string
  patch_url: string
  issue_url: string
  commits_url: string
  review_comments_url: string
  review_comment_url: string
  comments_url: string
  statuses_url: string
  number: number
  state: string
  locked: boolean
  title: string
  user: Assignee
  body: string
  labels: Label[]
  milestone: Milestone
  active_lock_reason: string
  created_at: Date
  updated_at: Date
  closed_at: Date
  merged_at: Date
  merge_commit_sha: string
  assignee: Assignee
  assignees: Assignee[]
  requested_reviewers: Assignee[]
  requested_teams: RequestedTeam[]
  head: Base
  base: Base
  _links: Links
  author_association: string
  auto_merge: null
  draft: boolean
  merged: boolean
  mergeable: boolean
  rebaseable: boolean
  mergeable_state: string
  merged_by: Assignee
  comments: number
  review_comments: number
  maintainer_can_modify: boolean
  commits: number
  additions: number
  deletions: number
  changed_files: number
}

type Links = {
  self: Comments
  html: Comments
  issue: Comments
  comments: Comments
  review_comments: Comments
  review_comment: Comments
  commits: Comments
  statuses: Comments
}

type Comments = {
  href: string
}

type Assignee = {
  login: Login
  id: number
  node_id: NodeID
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: FollowingURL
  gists_url: GistsURL
  starred_url: StarredURL
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: EventsURL
  received_events_url: string
  type: Type
  site_admin: boolean
}

enum EventsURL {
  HTTPSAPIGithubCOMUsersHubotEventsPrivacy = 'https://api.github.com/users/hubot/events{/privacy}',
  HTTPSAPIGithubCOMUsersOctocatEventsPrivacy = 'https://api.github.com/users/octocat/events{/privacy}',
  HTTPSAPIGithubCOMUsersOtherUserEventsPrivacy = 'https://api.github.com/users/other_user/events{/privacy}'
}

enum FollowingURL {
  HTTPSAPIGithubCOMUsersHubotFollowingOtherUser = 'https://api.github.com/users/hubot/following{/other_user}',
  HTTPSAPIGithubCOMUsersOctocatFollowingOtherUser = 'https://api.github.com/users/octocat/following{/other_user}',
  HTTPSAPIGithubCOMUsersOtherUserFollowingOtherUser = 'https://api.github.com/users/other_user/following{/other_user}'
}

enum GistsURL {
  HTTPSAPIGithubCOMUsersHubotGistsGistID = 'https://api.github.com/users/hubot/gists{/gist_id}',
  HTTPSAPIGithubCOMUsersOctocatGistsGistID = 'https://api.github.com/users/octocat/gists{/gist_id}',
  HTTPSAPIGithubCOMUsersOtherUserGistsGistID = 'https://api.github.com/users/other_user/gists{/gist_id}'
}

enum Login {
  Hubot = 'hubot',
  Octocat = 'octocat',
  OtherUser = 'other_user'
}

enum NodeID {
  MDQ6VXNlcjE = 'MDQ6VXNlcjE='
}

enum StarredURL {
  HTTPSAPIGithubCOMUsersHubotStarredOwnerRepo = 'https://api.github.com/users/hubot/starred{/owner}{/repo}',
  HTTPSAPIGithubCOMUsersOctocatStarredOwnerRepo = 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
  HTTPSAPIGithubCOMUsersOtherUserStarredOwnerRepo = 'https://api.github.com/users/other_user/starred{/owner}{/repo}'
}

enum Type {
  User = 'User'
}

type Base = {
  label: string
  ref: string
  sha: string
  user: Assignee
  repo: Repo
}

type Repo = {
  id: number
  node_id: string
  name: string
  full_name: string
  owner: Assignee
  private: boolean
  html_url: string
  description: string
  fork: boolean
  url: string
  archive_url: string
  assignees_url: string
  blobs_url: string
  branches_url: string
  collaborators_url: string
  comments_url: string
  commits_url: string
  compare_url: string
  contents_url: string
  contributors_url: string
  deployments_url: string
  downloads_url: string
  events_url: string
  forks_url: string
  git_commits_url: string
  git_refs_url: string
  git_tags_url: string
  git_url: string
  issue_comment_url: string
  issue_events_url: string
  issues_url: string
  keys_url: string
  labels_url: string
  languages_url: string
  merges_url: string
  milestones_url: string
  notifications_url: string
  pulls_url: string
  releases_url: string
  ssh_url: string
  stargazers_url: string
  statuses_url: string
  subscribers_url: string
  subscription_url: string
  tags_url: string
  teams_url: string
  trees_url: string
  clone_url: string
  mirror_url: string
  hooks_url: string
  svn_url: string
  homepage: string
  language: null
  forks_count: number
  stargazers_count: number
  watchers_count: number
  size: number
  default_branch: string
  open_issues_count: number
  topics: string[]
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  has_pages: boolean
  has_downloads: boolean
  has_discussions: boolean
  archived: boolean
  disabled: boolean
  pushed_at: Date
  created_at: Date
  updated_at: Date
  permissions: Permissions
  allow_rebase_merge: boolean
  temp_clone_token: string
  allow_squash_merge: boolean
  allow_merge_commit: boolean
  forks: number
  open_issues: number
  license: License
  watchers: number
  allow_forking?: boolean
}

type License = {
  key: string
  name: string
  url: string
  spdx_id: string
  node_id: string
}

type Label = {
  id: number
  node_id: string
  url: string
  name: string
  description: string
  color: string
  default: boolean
}

type Milestone = {
  url: string
  html_url: string
  labels_url: string
  id: number
  node_id: string
  number: number
  state: string
  title: string
  description: string
  creator: Assignee
  open_issues: number
  closed_issues: number
  created_at: Date
  updated_at: Date
  closed_at: Date
  due_on: Date
}

type RequestedTeam = {
  id: number
  node_id: string
  url: string
  html_url: string
  name: string
  slug: string
  description: string
  privacy: string
  notification_setting: string
  permission: string
  members_url: string
  repositories_url: string
}

type PullRequestCreate = {
  title: string
  body: string
  head: string
  base: string
  repo: string
}

type PullRequest = PullRequestCreate & {
  id: number
  number: number
  url: string
  state: string
}

export const getProjectList = async (): Promise<Project[]> => {
  const response = await fetch(
    `https://api.github.com/orgs/${process.env.GITHUB_ORGANIZATION}/repos?sort=full_name&per_page=100`,
    {
      method: 'get',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    }
  )

  if (!response.ok) return []

  const githubProjects = (await response.json()) as GithubProject[]

  return githubProjects.map(({ id, name }) => ({ id, name }))
}

export const createPullRequest = async (pullRequestCreate: PullRequestCreate): Promise<PullRequest> => {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_ORGANIZATION}/${pullRequestCreate.repo}/pulls`,
    {
      method: 'post',
      body: {
        title: pullRequestCreate.title,
        body: pullRequestCreate.body,
        head: pullRequestCreate.head,
        base: pullRequestCreate.base,
        draft: true
      },
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    }
  )

  if (!response.ok) return Promise.reject('Fail to create PR')

  const githubPullRequest = (await response.json()) as GithubPullRequest

  return {
    id: githubPullRequest.id,
    number: githubPullRequest.number,
    url: githubPullRequest.html_url,
    state: githubPullRequest.state,
    title: githubPullRequest.title,
    body: githubPullRequest.body,
    head: githubPullRequest.head.ref,
    base: githubPullRequest.base.ref,
    repo: githubPullRequest.base.repo.name
  }
}
