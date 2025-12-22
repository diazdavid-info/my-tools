import { create } from 'zustand'
import type { Task, TaskStatus } from '@/types/task'
import { jiraTasksToTasks } from '@/lib/converter.ts'
import type { ItemList, State } from '@/types/tasks-store'

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

const initialState = {
  devItemList: [],
  projectItemList: [],
  typeItemList: [],

  content: null,
  tasks: [],
  tasksOptions: {
    dev: undefined,
    epic: undefined,
    project: undefined,
    type: undefined
  }
}

export const useTasksStore = create<State>((set) => ({
  ...initialState,

  createTask: (content: string) =>
    set(({ tasksOptions }) => {
      try {
        const jsonContent = JSON.parse(content)
        const parent = jsonContent.fields.parent.key
        const tasks = jiraTasksToTasks(jsonContent)

        return {
          tasks,
          tasksOptions: { ...tasksOptions, epic: parent },
          content: jsonContent
        }
      } catch (e: any) {
        console.log(e.message)
        return {}
      }
    }),
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
