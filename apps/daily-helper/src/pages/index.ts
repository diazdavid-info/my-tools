import type {Task} from "../task/jira-provider.ts";

type StatusList = {
  [key: string]: string
}

type TaskGrouped = {
  [key: string]: {
    [key: string]: Task[]
  }
}

type Steps = {
  [key: string]: {
    [key: string]: {
      [key: string]: Task[]
    }
  }
}

const getStatus = (status: string): string => {
  const statusList: StatusList = {
    'Blocked': 'BLOCKED',
    'Blocked Review': 'BLOCKED',
    'Blocked product review': 'BLOCKED',
    'Build Broken': 'BLOCKED',
    'Building': 'BLOCKED',
    'Closed': 'DONE',
    'Design Accepted': 'PR ACCEPTED',
    'Done': 'DONE',
    'IN PROGRESS': 'IN PROGRESS',
    'In Progress': 'IN PROGRESS',
    'In QA': 'IN PROGRESS',
    'In Review': 'IN PROGRESS',
    'Open': 'TO DO',
    'PR Accepted': 'PR ACCEPTED',
    'Pending': 'TO DO',
    'Product review in progress': 'IN PROGRESS',
    'Reimplement': 'TO DO',
    'Reopened': 'TO DO',
    'Resolved': 'DONE',
    'Review in progress': 'IN PROGRESS',
    'To Do': 'TO DO',
    'To Front Review': 'TO REVIEW',
    'To Product Review': 'TO REVIEW',
    'To Review': 'TO REVIEW',
    'WIP IN PROGRESS': 'IN PROGRESS',
    'Waiting BG': 'BLOCKED',
    'Waiting Design': 'BLOCKED',
    'Waiting Product': 'BLOCKED',
    'Waiting QADoc': 'BLOCKED',
    'Waiting for approval': 'BLOCKED',
    'Work in progress': 'IN PROGRESS'
  }

  return statusList[status] ?? 'DONE'
}

export const group = (tasks: Task[]): TaskGrouped => {
  const stories: TaskGrouped = {}

  tasks.forEach(task => {
    const storyName = task.storyName
    const statusTask = getStatus(task.statusName)

    if(!stories[storyName]) stories[storyName] = {
      'TO DO': [],
      'BLOCKED': [],
      'IN PROGRESS': [],
      'TO REVIEW': [],
      'PR ACCEPTED': [],
      'DONE': []
    }
    stories[storyName][statusTask].push({ ...task })
  })

  return stories
}

export const createSteps = (tasks: Task[]): Steps[] => {
  const stories: Steps = {}

  tasks.forEach(task => {
    const storyName = task.storyName
    const assignName = task.nameAssign
    const statusTask = getStatus(task.statusName)

    if(!stories[storyName]) stories[storyName] = {}

    if(!stories[storyName][assignName]) stories[storyName][assignName] = {
      'TO DO': [],
      'BLOCKED': [],
      'IN PROGRESS': [],
      'TO REVIEW': [],
      'PR ACCEPTED': [],
      'DONE': []
    }
    stories[storyName][assignName][statusTask].push({ ...task })
  })

  const steps: any = []

  Object.entries(stories).map(([storyName, userList]) => {
    Object.entries(userList).map(([userName, value]) => {
      steps.push({storyName, userName, value})
    })
  })

  return steps
}
