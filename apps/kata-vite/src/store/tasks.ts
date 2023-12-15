import { create } from 'zustand'
import { Task } from '@/types/task'
import { jiraTasksToTasks, tasksToCommand } from '@/lib/converter.ts'
import { JiraTask } from '@/lib/__tests__/fixture.ts'

type TaskOptions = {
  dev?: string
  epic?: string
  project?: string
  type?: string
}

type State = {
  devItemList: { key: string; value: string }[]
  projectItemList: { key: string; value: string }[]
  typeItemList: { key: string; value: string }[]

  token: string
  domain: string
  tasks: Task[]
  content: JiraTask | null
  tasksOptions: TaskOptions
  command: string

  addToken: (token: string) => void
  addDomain: (domain: string) => void
  createTask: (content: string) => void
  setDev: (value: string) => void
  setEpic: (value: string) => void
  setProject: (value: string) => void
  setType: (value: string) => void

  setPointsTask: (id: string, points: number) => void
  setDevTask: (id: string, dev: string) => void
  setProjectTask: (id: string, dev: string) => void
  setTypeTask: (id: string, dev: string) => void
  setEpicTask: (id: string, dev: string) => void
}

const getLocalStorage = (key: string) => window.localStorage.getItem(key)
const setLocalStorage = (key: string, value: string) => window.localStorage.setItem(key, value)

export const useTasksStore = create<State>((set) => ({
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
  command: '',

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
      const taskFound = tasks.find(({ id: taskId }) => taskId === id)
      if (!taskFound) return {}

      const newTask: Task = { ...taskFound, points }
      const restTasks = tasks.filter(({ id: taskId }) => taskId !== id)
      const allTasks = [newTask, ...restTasks]

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setDevTask: (id: string, dev: string) => {
    set(({ tasks, token, domain }) => {
      const taskFound = tasks.find(({ id: taskId }) => taskId === id)
      if (!taskFound) return {}

      const newTask: Task = { ...taskFound, dev }
      const restTasks = tasks.filter(({ id: taskId }) => taskId !== id)
      const allTasks = [newTask, ...restTasks]

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setProjectTask: (id: string, project: string) => {
    set(({ tasks, token, domain }) => {
      const taskFound = tasks.find(({ id: taskId }) => taskId === id)
      if (!taskFound) return {}

      const newTask: Task = { ...taskFound, project }
      const restTasks = tasks.filter(({ id: taskId }) => taskId !== id)
      const allTasks = [newTask, ...restTasks]

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setTypeTask: (id: string, type: string) => {
    set(({ tasks, token, domain }) => {
      const taskFound = tasks.find(({ id: taskId }) => taskId === id)
      if (!taskFound) return {}

      const newTask: Task = { ...taskFound, type }
      const restTasks = tasks.filter(({ id: taskId }) => taskId !== id)
      const allTasks = [newTask, ...restTasks]

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  },
  setEpicTask: (id: string, epic: string) => {
    set(({ tasks, token, domain }) => {
      const taskFound = tasks.find(({ id: taskId }) => taskId === id)
      if (!taskFound) return {}

      const newTask: Task = { ...taskFound, epic }
      const restTasks = tasks.filter(({ id: taskId }) => taskId !== id)
      const allTasks = [newTask, ...restTasks]

      return {
        tasks: allTasks,
        command: tasksToCommand({ tasks: allTasks, token, domain })
      }
    })
  }
}))
