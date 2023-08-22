const clearName = (name: string): string =>
  name
    ?.trim()
    .normalize('NFD')
    .replace(/\[.*]\s/, '')
    .replace(/\+\s/, '')
    .replace(/-\s/, '')
    .replace(/\./, '')
    .replace(/\s/g, '-')
    .replace(/:/g, '')
    .replace(/"/g, '')
    .replace(/&/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const getTypeTask = (type: string): string => {
  if (type === 'Epic') return 'story'
  if (type === 'bug') return 'fix'
  return 'feat'
}

export const formatBranchName = (tasks: string): string[] => {
  const [key, summary, type] = tasks.split(';')

  const typeTask = getTypeTask(type)
  const summaryFormat = clearName(summary)

  return [`${typeTask}/${key}_${summaryFormat}`, `${typeTask}/${key}`, `${key}`]
}
