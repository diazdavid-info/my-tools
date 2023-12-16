import { PropsWithChildren } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { useTasksStore } from '@/store/tasks-store.ts'

type DevSelectProps = {
  className: string
}

export const DevSelect = ({ className }: PropsWithChildren<DevSelectProps>) => {
  const { setDev, devItemList } = useTasksStore((state) => state)
  const handleChange = (value: string) => {
    setDev(value)
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Equipo" />
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
