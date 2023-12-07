import { PropsWithChildren } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { useTasksStore } from '@/store/tasks.ts'

type DevSelectProps = {
  className: string
}

export const DevSelect = ({ className }: PropsWithChildren<DevSelectProps>) => {
  const setDev = useTasksStore((state) => state.setDev)
  const handleChange = (value: string) => {
    setDev(value)
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Equipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Backend">Backend</SelectItem>
        <SelectItem value="Frontend">Frontend</SelectItem>
        <SelectItem value="Tech">Tech</SelectItem>
      </SelectContent>
    </Select>
  )
}
