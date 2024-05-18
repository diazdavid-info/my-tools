export type ProjectTools = {
  jira?: {
    domain: string
    authorization: string
  }
  github?: {
    token: string
    organization: string
  }
}

export type GeneralTools = {
  jira: {
    domain: string
    authorization: string
  }
  github: {
    token: string
    organization: string
  }
}

export enum ConfigTaskStatus {
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export type ConfigTask = {
  jiraId: string
  jiraName: string
  jiraType: string
  jiraUrl: string
  status: ConfigTaskStatus
  createdAt: number
  updatedAt: number
}

export type Config = {
  tools: GeneralTools
  projects: {
    [key: string]: {
      tools: ProjectTools
      createdAt: number
      updatedAt: number
      tasks: ConfigTask[]
    }
  }
  advanced: boolean
  debug: boolean
  experimental: boolean
}

export const contentConfig: Config = {
  tools: {
    jira: {
      domain: process.env.JIRA_DOMAIN ?? '',
      authorization: process.env.JIRA_AUTHORIZATION ?? ''
    },
    github: {
      token: process.env.GITHUB_TOKEN ?? '',
      organization: process.env.GITHUB_ORGANIZATION ?? ''
    }
  },
  projects: {},
  advanced: false,
  debug: false,
  experimental: false
}
