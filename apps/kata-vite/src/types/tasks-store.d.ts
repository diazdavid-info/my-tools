import { Task } from '@/types/task'
import { JiraTask } from '@/lib/__tests__/fixture.ts'

type TaskOptions = {
  dev?: string
  epic?: string
  project?: string
  type?: string
}

type ItemList = {
  key: string
  value: string
}

type State = {
  devItemList: ItemList[]
  projectItemList: ItemList[]
  typeItemList: ItemList[]

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
  setDisabledTask: (id: string, disabled: boolean) => void
}
