import { Input } from '@/components/ui/input.tsx'
import type { ChangeEvent, PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'

type TaskInputProps = {
  className: string
}

export const TaskInput = ({ className }: PropsWithChildren<TaskInputProps>) => {
  const loadTasks = useTasksStore((state) => state.loadTasks)

  const handleOnBlur = (event: ChangeEvent<HTMLInputElement>) => {
    const key = event.target.value.trim()
    if (!key) return
    loadTasks(key).catch(console.error)
  }

  return (
    <Input
      className={className}
      onBlur={handleOnBlur}
      type="text"
      placeholder="Key Jira Task"
    />
  )
}
