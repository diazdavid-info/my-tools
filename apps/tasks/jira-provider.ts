import fetch from 'node-fetch'

export type Task = {
  id: string
  name: string
  type: string
  url: string
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

  const jiraResponse: any = await response.json()
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
    return { id: key, name: summary, type: name, url: self }
  })
}
