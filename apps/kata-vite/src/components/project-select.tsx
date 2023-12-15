import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'

type ProjectSelectProps = {
  className: string
}

export const ProjectSelect = ({ className }: PropsWithChildren<ProjectSelectProps>) => {
  const { setProject, projectItemList } = useTasksStore((state) => state)
  const handleChange = (value: string) => {
    setProject(value)
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Projecto" />
      </SelectTrigger>
      <SelectContent>
        {projectItemList.map(({ key, value }) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
