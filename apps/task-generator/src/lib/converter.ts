import type { Task } from '@/types/task'
import type { JiraTask } from '@/types/jira-task'

const generateTitleAndPoints = (listItem: any) => {
  const [title, points = '0'] = listItem.content[0].content[0].text.split('→')
  return [title.trim(), parseInt(points.trim())]
}
export const jiraTasksToTasks = (data: JiraTask): Task[] => {
  const parent = data.fields.parent.key
  const parentName = data.fields.parent.fields.summary
  const content = data.fields.comment.comments[0].body.content
  const [firstElement] = content.filter((bodyContent) =>
    ['bulletList', 'orderedList'].includes(bodyContent.type)
  )
  const { content: bulletListContent } = firstElement

  return bulletListContent.map((listItem, index) => {
    const [title, points] = generateTitleAndPoints({ ...listItem })
    return {
      id: index,
      title,
      points,
      epic: parent,
      epicSummary: parentName,
      content: JSON.stringify(
        [{ type: 'bulletList', content: [listItem] }],
        null,
        2
      ),
      disabled: title.startsWith('[CREATED]'),
      url: '',
      status: 'TO_DO'
    }
  })
}
