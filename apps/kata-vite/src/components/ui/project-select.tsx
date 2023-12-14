import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks.ts'

type ProjectSelectProps = {
  className: string
}

export const ProjectSelect = ({ className }: PropsWithChildren<ProjectSelectProps>) => {
  const setProject = useTasksStore((state) => state.setProject)
  const handleChange = (value: string) => {
    setProject(value)
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Projecto" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10000">BookingApp (BOOK)</SelectItem>
        <SelectItem value="10001">API (API)</SelectItem>
        <SelectItem value="10002">Admin (ADM)</SelectItem>
      </SelectContent>
    </Select>
  )
}
