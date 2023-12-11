import { Task } from '@/types/task'

export const htmlElementToTasks = (data: string): Task[] => {
  const template = document.createElement('template')
  template.innerHTML = data
  const result = template.content.children
  const element = result.item(0)

  if (element === null) return []

  const tasks: Task[] = []
  const children = [...element.children]

  children.forEach((e) => {
    console.log([...e.children])
    const [firstElement, secondElement] = [...e.children]
    if (firstElement.textContent === null) return
    const [title, points] = firstElement.textContent.split('→')
    tasks.push({
      id: title,
      title: title.trim(),
      points: parseInt(points.trim()),
      content: [...secondElement.children].map((e) => `${e.textContent}\n`)
    })
  })

  return tasks
}

export const tasksToCommand = ({ tasks, token, domain }: { tasks: Task[]; token: string; domain: string }): string => {
  const commandList = tasks.map((task) => {
    const { epic, type, dev, project, points, content, title } = task
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
          content: content.map((txt) => ({ type: 'paragraph', content: [{ type: 'text', text: txt }] }))
        }
      }
    }
    return `
      curl - sX POST '${domain}/rest/api/3/issue' \\
      -H 'Content-Type: application/json' \\
      -H 'Authorization: Basic ${token}' \\
      -d '${JSON.stringify({ ...body })}'`
  })

  return commandList.join(';')
}
