import type { Task, TaskStatus } from '@/types/task'
import type { JiraTask } from '@/types/jira-task'

export type TaskOptions = {
  dev?: string
  epic?: string
  project?: string
  type?: string
}

export type ItemList = {
  key: string
  value: string
}

export type State = {
  devItemList: ItemList[]
  projectItemList: ItemList[]
  typeItemList: ItemList[]

  taskKey: string
  tasks: Task[]
  content: JiraTask | null
  tasksOptions: TaskOptions

  loadTasks: (taskKey: string) => Promise<void>
  refreshTasks: () => Promise<void>
  setDev: (value: string) => void
  setDevList: (itemList: ItemList[]) => void
  setEpic: (value: string) => void
  setProject: (value: string) => void
  setProjectList: (itemList: ItemList[]) => void
  setType: (value: string) => void
  setTypeList: (itemList: ItemList[]) => void

  setPointsTask: (id: number, points: number) => void
  setDevTask: (id: number, dev: string) => void
  setProjectTask: (id: number, dev: string) => void
  setTypeTask: (id: number, dev: string) => void
  setEpicTask: (id: number, dev: string) => void
  setDisabledTask: (id: number, disabled: boolean) => void
  setStatusTask: (id: number, status: TaskStatus) => void
  setUrlTask: (id: number, url: string) => void
}
