import { create } from 'zustand'
import { Task } from '@/types/task'
import { htmlElementToTasks, tasksToCommand } from '@/lib/converter.ts'

type TaskOptions = {
  dev?: string
  epic?: string
  project?: string
  type?: string
}

type State = {
  token: string
  domain: string
  tasks: Task[]
  content: string
  tasksOptions: TaskOptions
  command: string

  addToken: (token: string) => void
  addDomain: (domain: string) => void
  createTask: (content: string) => void
  setDev: (value: string) => void
  setEpic: (value: string) => void
  setProject: (value: string) => void
  setType: (value: string) => void
}

const getLocalStorage = (key: string) => window.localStorage.getItem(key)
const setLocalStorage = (key: string, value: string) => window.localStorage.setItem(key, value)

export const useTasksStore = create<State>((set) => ({
  token: getLocalStorage('token') || '',
  domain: getLocalStorage('domain') || '',
  content: '',
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
  createTask: (content) =>
    set(({ token, domain }) => {
      const tasks = htmlElementToTasks(content)

      return {
        tasks,
        content,
        command: tasksToCommand({ tasks, token, domain })
      }
    }),
  setDev: (value: string) =>
    set(({ tasks, tasksOptions, token, domain }) => {
      const newTasks = tasks.map((task) => ({ ...task, dev: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, dev: value },
        command: tasksToCommand({ tasks, token, domain })
      }
    }),
  setEpic: (value: string) =>
    set(({ tasks, tasksOptions, token, domain }) => {
      const newTasks = tasks.map((task) => ({ ...task, epic: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, epic: value },
        command: tasksToCommand({ tasks, token, domain })
      }
    }),
  setProject: (value: string) =>
    set(({ tasks, tasksOptions, token, domain }) => {
      const newTasks = tasks.map((task) => ({ ...task, project: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, project: value },
        command: tasksToCommand({ tasks, token, domain })
      }
    }),
  setType: (value: string) =>
    set(({ tasks, tasksOptions, token, domain }) => {
      const newTasks = tasks.map((task) => ({ ...task, type: value }))

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, type: value },
        command: tasksToCommand({ tasks, token, domain })
      }
    })
}))
