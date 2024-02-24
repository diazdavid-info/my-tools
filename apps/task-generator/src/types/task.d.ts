export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'CREATED'

export type Task = {
  id: number
  title: string
  points: number
  dev?: string
  epic?: string
  project?: string
  type?: string
  url?: string
  status: TaskStatus
  content: string
  disabled: boolean
}
