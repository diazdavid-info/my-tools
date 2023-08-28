import fetch from 'node-fetch'

export type Task = {
  id: string
  name: string
  type: string
  url: string
}

type JiraResponse = {
  expand: string
  startAt: number
  maxResults: number
  total: number
  issues: Issue[]
  names: Names
}

type Issue = {
  expand: string
  id: string
  self: string
  key: string
  fields: Fields
}

type Fields = {
  summary: string
  issuetype: Issuetype
}

type Issuetype = {
  self: string
  id: string
  description: string
  iconUrl: string
  name: string
  subtask: boolean
  avatarId?: number
  hierarchyLevel: number
}

type Names = {
  summary: string
  issuetype: string
}

export const searchInProgressTasks = async (): Promise<Task[]> => {
  const url = `${process.env.JIRA_DOMAIN}/rest/api/3/search`
  const body = {
    expand: ['names'],
    maxResults: 50,
    fieldsByKeys: false,
    fields: ['summary', 'issuetype'],
    startAt: 0,
    jql: 'status = "In Progress"'
  }

  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${process.env.JIRA_AUTHORIZATION}`
    }
  })

  if (!response.ok) return []

  const jiraResponse = (await response.json()) as JiraResponse
  const { issues = [] } = jiraResponse

  return issues.map((issue: any) => {
    const {
      fields: {
        summary,
        issuetype: { name }
      },
      key,
      self
    } = issue
    return { id: key.trim(), name: summary.trim(), type: name.trim(), url: self.trim() }
  })
}
