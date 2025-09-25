import fetch from 'node-fetch'
import { Task } from './task'

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
  status: Status
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

type Status = {
  name: string
}

export enum TaskOwnership {
  MY_TASKS = 1,
  ALL = 2
}

const getQuery = (ownership: TaskOwnership): string => {
  const inProgress = 'status = "In Progress"'
  if (ownership === TaskOwnership.MY_TASKS) return `${inProgress} AND assignee = currentUser()`

  return inProgress
}

export const searchInProgressTasks = async (ownership: TaskOwnership): Promise<Task[]> => {
  const url = `${process.env.JIRA_DOMAIN}/rest/api/3/search/jql`
  const body = {
    expand: 'names',
    maxResults: 50,
    fieldsByKeys: false,
    fields: ['summary', 'issuetype', 'status'],
    jql: getQuery(ownership)
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
        issuetype: { name },
        status: { name: statusName }
      },
      key,
      self
    } = issue
    return { id: key.trim(), name: summary.trim(), type: name.trim(), url: self.trim(), status: statusName }
  })
}

export const findTask = async (taskId: string): Promise<Task | null> => {
  const url = `${process.env.JIRA_DOMAIN}/rest/api/3/issue/${taskId}`

  const response = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${process.env.JIRA_AUTHORIZATION}`
    }
  })

  if (!response.ok) return null

  const issue = (await response.json()) as Issue

  const {
    fields: {
      summary,
      issuetype: { name },
      status: { name: statusName }
    },
    key,
    self
  } = issue

  return { id: key.trim(), name: summary.trim(), type: name.trim(), url: self.trim(), status: statusName }
}
