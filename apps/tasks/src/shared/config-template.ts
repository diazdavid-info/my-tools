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

export type Config = {
  tools: GeneralTools
  projects: {
    [key: string]: {
      tools: ProjectTools
      createdAt: number
      updatedAt: number
    }
  }
  advanced: boolean
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
  advanced: false
}
