import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import {type PropsWithChildren, useEffect} from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'

type TaskTypeSelectProps = {
  className: string
}

export const TaskTypeSelect = ({ className }: PropsWithChildren<TaskTypeSelectProps>) => {
  const setType = useTasksStore((state) => state.setType)
  const setTypeList = useTasksStore((state) => state.setTypeList)
  const typeItemList = useTasksStore((state) => state.typeItemList)

  useEffect(() => {
    fetch('/api/tasks/types?projectId=10001')
      .then(data => data.json())
      .then(setTypeList)
      .catch(console.error)
  }, []);

  const handleChange = (value: string) => {
    setType(value)
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Tipo de tarea" />
      </SelectTrigger>
      <SelectContent>
        {typeItemList.map(({ key, value }) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
