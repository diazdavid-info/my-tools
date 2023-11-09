import { Task } from '../shared/task'

const clearName = (name: string): string =>
  name
    ?.trim()
    .normalize('NFD')
    .replace(/\[.*]\s/, '')
    .replace(/\+\s/, '')
    .replace(/-\s/, '')
    .replace(/\./, '')
    .replace(/>/g, '')
    .replace(/</g, '')
    .replace(/:/g, '')
    .replace(/"/g, '')
    .replace(/&/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s/g, '-')
    .toLowerCase()

const getTypeTask = (type: string): string => {
  if (type === 'Epic') return 'story'
  if (type === 'Bug') return 'fix'
  return 'feat'
}

export const formatBranchName = (task: Task): [string, string, string] => {
  const { id, name, type } = task

  const typeTask = getTypeTask(type)
  const summaryFormat = clearName(name)

  return [`${typeTask}/${id}_${summaryFormat}`, `${typeTask}/${id}`, `${id}`]
}
