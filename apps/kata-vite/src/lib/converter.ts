import { Task } from '@/types/task'
import { JiraTask } from '@/types/jira-task'

const generateTitleAndPoints = (listItem: any) => {
  const [title, points = '0'] = listItem.content[0].content[0].text.split('→')
  return [title.trim(), parseInt(points.trim())]
}
export const jiraTasksToTasks = (data: JiraTask): Task[] => {
  const content = data.fields.comment.comments[0].body.content
  const [firstElement] = content.filter((bodyContent) => ['bulletList', 'orderedList'].includes(bodyContent.type))
  const { content: bulletListContent } = firstElement

  return bulletListContent.map((listItem, index) => {
    const [title, points] = generateTitleAndPoints({ ...listItem })
    return {
      id: index.toString(),
      title,
      points,
      content: JSON.stringify([{ type: 'bulletList', content: [listItem] }], null, 2),
      disabled: false
    }
  })
}

export const tasksToCommand = ({ tasks, token, domain }: { tasks: Task[]; token: string; domain: string }): string => {
  const commandList = []

  for (const task of tasks) {
    const { epic, type, dev, project, points, content, title, disabled } = task
    if (disabled) continue
    const body = {
      fields: {
        summary: title,
        parent: { key: epic },
        issuetype: { id: type },
        customfield_10030: { id: '10020', value: dev },
        project: { id: project },
        customfield_10026: points,
        description: {
          type: 'doc',
          version: 1,
          content: JSON.parse(content)
        }
      }
    }
    commandList.push(`
      curl -sX POST '${domain}/rest/api/3/issue' \\
      -H 'Content-Type: application/json' \\
      -H 'Authorization: Basic ${token}' \\
      -d '${JSON.stringify({ ...body })}'`)
  }

  return commandList.join(';')
}
