import { create } from 'zustand'
import type { Task, TaskStatus } from '@/types/task'
import { jiraTasksToTasks } from '@/lib/converter.ts'
import type { ItemList, State } from '@/types/tasks-store'
import type { JiraTask } from '@/types/jira-task'

const updatePropTask = <T>(
  id: number,
  prop: string,
  value: T,
  tasks: Task[]
): Task[] => {
  const taskFound = tasks.find(({ id: taskId }) => taskId === id)
  if (!taskFound) return []

  const newTask: Task = { ...taskFound, [prop]: value }
  const restTasks = tasks.filter(({ id: taskId }) => taskId !== id)
  return [newTask, ...restTasks].sort((a: Task, b: Task) => a.id - b.id)
}

const applyTaskOptions = (
  tasks: Task[],
  tasksOptions: State['tasksOptions']
): Task[] =>
  tasks.map((task) => ({
    ...task,
    ...(tasksOptions.dev == null ? {} : { dev: tasksOptions.dev }),
    ...(tasksOptions.epic == null ? {} : { epic: tasksOptions.epic }),
    ...(tasksOptions.project == null ? {} : { project: tasksOptions.project }),
    ...(tasksOptions.type == null ? {} : { type: tasksOptions.type })
  }))

const fetchTasks = async (taskKey: string): Promise<JiraTask> => {
  const response = await fetch(`/api/tasks/${taskKey}`)
  if (!response.ok) throw new Error('No se pudieron cargar las tareas')

  return response.json()
}

const createTasksState = (
  jsonContent: JiraTask,
  tasksOptions: State['tasksOptions'],
  preserveOptions = false
) => {
  const parent = jsonContent.fields.parent.key
  const nextTasksOptions = preserveOptions
    ? tasksOptions
    : { ...tasksOptions, epic: parent }

  return {
    tasks: applyTaskOptions(jiraTasksToTasks(jsonContent), nextTasksOptions),
    tasksOptions: nextTasksOptions,
    content: jsonContent
  }
}

const initialState = {
  devItemList: [],
  projectItemList: [],
  typeItemList: [],

  taskKey: '',
  content: null,
  tasks: [],
  tasksOptions: {
    dev: undefined,
    epic: undefined,
    project: undefined,
    type: undefined
  }
}

export const useTasksStore = create<State>((set, get) => ({
  ...initialState,

  loadTasks: async (taskKey: string) => {
    const key = taskKey.trim()
    if (!key) return

    const jsonContent = await fetchTasks(key)
    set(({ tasksOptions }) => ({
      ...createTasksState(jsonContent, tasksOptions),
      taskKey: key
    }))
  },
  refreshTasks: async () => {
    const key = get().taskKey.trim()
    if (!key) return

    const jsonContent = await fetchTasks(key)
    set(({ tasksOptions }) => ({
      ...createTasksState(jsonContent, tasksOptions, true),
      taskKey: key
    }))
  },
  setDev: (value: string) =>
    set(({ tasks, tasksOptions }) => {
      const newTasks = tasks.map((task) => ({ ...task, dev: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, dev: value }
      }
    }),
  setDevList: (itemList: ItemList[]) =>
    set(() => {
      return {
        devItemList: itemList
      }
    }),
  setEpic: (value: string) =>
    set(({ tasks, tasksOptions }) => {
      const newTasks = tasks.map((task) => ({ ...task, epic: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, epic: value }
      }
    }),
  setProject: (value: string) =>
    set(({ tasks, tasksOptions }) => {
      const newTasks = tasks.map((task) => ({ ...task, project: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, project: value }
      }
    }),
  setProjectList: (itemList: ItemList[]) =>
    set(() => {
      return {
        projectItemList: itemList
      }
    }),
  setType: (value: string) =>
    set(({ tasks, tasksOptions }) => {
      const newTasks = tasks.map((task) => ({ ...task, type: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, type: value }
      }
    }),
  setTypeList: (itemList: ItemList[]) =>
    set(() => {
      return {
        typeItemList: itemList
      }
    }),
  setPointsTask: (id: number, points: number) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, 'points', points, tasks)

      return {
        tasks: allTasks
      }
    })
  },
  setDevTask: (id: number, dev: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, 'dev', dev, tasks)

      return {
        tasks: allTasks
      }
    })
  },
  setProjectTask: (id: number, project: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, 'project', project, tasks)

      return {
        tasks: allTasks
      }
    })
  },
  setTypeTask: (id: number, type: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, 'type', type, tasks)

      return {
        tasks: allTasks
      }
    })
  },
  setEpicTask: (id: number, epic: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, 'epic', epic, tasks)

      return {
        tasks: allTasks
      }
    })
  },
  setDisabledTask: (id: number, disabled: boolean) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, 'disabled', disabled, tasks)

      return {
        tasks: allTasks
      }
    })
  },
  setStatusTask: (id: number, status: TaskStatus) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, 'status', status, tasks)

      return {
        tasks: allTasks
      }
    })
  },
  setUrlTask: (id: number, url: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, 'url', url, tasks)

      return {
        tasks: allTasks
      }
    })
  }
}))
