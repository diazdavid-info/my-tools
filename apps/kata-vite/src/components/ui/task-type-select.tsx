import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks.ts'

type TaskTypeSelectProps = {
  className: string
}

export const TaskTypeSelect = ({ className }: PropsWithChildren<TaskTypeSelectProps>) => {
  const setType = useTasksStore((state) => state.setType)
  const handleChange = (value: string) => {
    setType(value)
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Tipo de tarea" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="book">Task</SelectItem>
        <SelectItem value="dark">Spike</SelectItem>
        <SelectItem value="system">Admin (ADM)</SelectItem>
      </SelectContent>
    </Select>
  )
}
