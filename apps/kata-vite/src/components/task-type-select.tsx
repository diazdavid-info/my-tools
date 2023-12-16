import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'

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
        <SelectItem value="10002">Task</SelectItem>
        <SelectItem value="10009">Spike</SelectItem>
      </SelectContent>
    </Select>
  )
}
