import { create } from 'zustand'
import { Task } from '@/types/task'
import { jiraTasksToTasks, tasksToCommand } from '@/lib/converter.ts'
import { State } from '@/types/tasks-store'

const getLocalStorage = (key: string) => window.localStorage.getItem(key)

const setLocalStorage = (key: string, value: string) => window.localStorage.setItem(key, value)

const updatePropTask = <T>(id: string, prop: string, value: T, tasks: Task[]): Task[] => {
  const taskFound = tasks.find(({ id: taskId }) => taskId === id)
  if (!taskFound) return []

  const newTask: Task = { ...taskFound, [prop]: value }
  const restTasks = tasks.filter(({ id: taskId }) => taskId !== id)
  return [newTask, ...restTasks].sort((a: Task, b: Task) => parseInt(a.id) - parseInt(b.id))
}

const initialState = {
  devItemList: [
    { key: 'Backend', value: 'Backend' },
    { key: 'Frontend', value: 'Frontend' },
    { key: 'Tech', value: 'Tech' }
  ],
  projectItemList: [
    { key: '10000', value: 'BookingApp (BOOK)' },
    { key: '10001', value: 'API (API)' },
    { key: '10002', value: 'Admin (ADM)' }
  ],
  typeItemList: [
    { key: '10002', value: 'Task' },
    { key: '10009', value: 'Spike' }
  ],

  token: getLocalStorage('token') || '',
  domain: getLocalStorage('domain') || '',
  content: null,
  tasks: [],
  tasksOptions: { dev: undefined, epic: undefined, project: undefined, type: undefined },
  command: ''
}

export const useTasksStore = create<State>((set) => ({
  ...initialState,

  addToken: (token) =>
    set(({ tasks, domain }) => {
      setLocalStorage('token', token)

      return {
        token,
        command: tasksToCommand({ tasks, token, domain })
      }
    }),
  addDomain: (domain) =>
    set(({ tasks, token }) => {
      setLocalStorage('domain', domain)

      return {
        domain,
        token,
        command: tasksToCommand({ tasks, token, domain })
      }
    }),
  createTask: (content: string) =>
    set(({ token, domain }) => {
      try {
        const jsonContent = JSON.parse(content)
        const tasks = jiraTasksToTasks(jsonContent)

        return {
          tasks,
          content: jsonContent,
          command: tasksToCommand({ tasks, token, domain })
        }
      } catch (e: any) {
        console.log(e.message)
        return {}
      }
    }),
  setDev: (value: string) =>
    set(({ tasks, tasksOptions, token, domain }) => {
      const newTasks = tasks.map((task) => ({ ...task, dev: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, dev: value },
        command: tasksToCommand({ tasks: newTasks, token, domain })
      }
    }),
  setEpic: (value: string) =>
    set(({ tasks, tasksOptions, token, domain }) => {
      const newTasks = tasks.map((task) => ({ ...task, epic: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, epic: value },
        command: tasksToCommand({ tasks: newTasks, token, domain })
      }
    }),
  setProject: (value: string) =>
    set(({ tasks, tasksOptions, token, domain }) => {
      const newTasks = tasks.map((task) => ({ ...task, project: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, project: value },
        command: tasksToCommand({ tasks: newTasks, token, domain })
      }
    }),
  setType: (value: string) =>
    set(({ tasks, tasksOptions, token, domain }) => {
      const newTasks = tasks.map((task) => ({ ...task, type: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, type: value },
        command: tasksToCommand({ tasks: newTasks, token, domain })
      }
    }),
  setPointsTask: (id: string, points: number) => {
    set(({ tasks, token, domain }) => {
      const allTasks = updatePropTask(id, 'points', points, tasks)

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setDevTask: (id: string, dev: string) => {
    set(({ tasks, token, domain }) => {
      const allTasks = updatePropTask(id, 'dev', dev, tasks)

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setProjectTask: (id: string, project: string) => {
    set(({ tasks, token, domain }) => {
      const allTasks = updatePropTask(id, 'project', project, tasks)

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setTypeTask: (id: string, type: string) => {
    set(({ tasks, token, domain }) => {
      const allTasks = updatePropTask(id, 'type', type, tasks)

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setEpicTask: (id: string, epic: string) => {
    set(({ tasks, token, domain }) => {
      const allTasks = updatePropTask(id, 'epic', epic, tasks)

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setDisabledTask: (id: string, disabled: boolean) => {
    set(({ tasks, token, domain }) => {
      const allTasks = updatePropTask(id, 'disabled', disabled, tasks)

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  }
}))
