export type Task = {
  id: number
  title: string
  points: number
  dev?: string
  epic?: string
  project?: string
  type?: string
  content: string
  disabled: boolean
}
