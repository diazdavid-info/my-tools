import { type PropsWithChildren, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.tsx'
import { useTasksStore } from '@/store/tasks-store.ts'

type DevSelectProps = {
  className: string
}

export const DevSelect = ({ className }: PropsWithChildren<DevSelectProps>) => {
  const setDev = useTasksStore((state) => state.setDev)
  const devItemList = useTasksStore((state) => state.devItemList)
  const setDevList = useTasksStore((state) => state.setDevList)

  useEffect(() => {
    fetch('/api/fields/customfield_10030')
      .then((data) => data.json())
      .then(setDevList)
      .catch(console.error)
  }, [])

  const handleChange = (value: string) => {
    setDev(value)
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Team" />
      </SelectTrigger>
      <SelectContent>
        {devItemList.map(({ key, value }) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
