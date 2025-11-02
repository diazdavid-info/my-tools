import prompts from 'prompts'
import { getInProgressTasks, removeTask } from '../shared/config'
import { findTask } from '../shared/jira-provider'

const run = async () => {
  const tasks = await getInProgressTasks()

  for (const task of tasks) {
    const taskFound = await findTask(task.jiraId)

    if (taskFound === null) continue

    console.log(taskFound)
    const { id, name, status } = taskFound

    const { confirmed } = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: `Do you want to close task "${name}" with status "${status}" and with id "${id}"?`,
    })

    console.log(confirmed)
    if (confirmed) await removeTask(taskFound)
  }
}

export default run
