import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.tsx'
import type { PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'

type ProjectSelectProps = {
  className: string
}

export const ProjectSelect = ({
  className
}: PropsWithChildren<ProjectSelectProps>) => {
  const setProject = useTasksStore((state) => state.setProject)
  const projectItemList = useTasksStore((state) => state.projectItemList)

  const handleChange = (value: string) => setProject(value)

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Project" />
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
