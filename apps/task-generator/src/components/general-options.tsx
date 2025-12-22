import { ProjectSelect } from '@/components/project-select.tsx'
import { TaskTypeSelect } from '@/components/task-type-select.tsx'
import { EpicInput } from '@/components/epic-input.tsx'
import { DevSelect } from '@/components/dev-select.tsx'
import { useEffect } from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'
import { allProjects } from '@/services/project-service.ts'
import { TaskInput } from '@/components/task-input.tsx'
import { ButtonCreateTasks } from '@/components/button-create-tasks.tsx'

export const GeneralOptions = () => {
  const setProjectList = useTasksStore((state) => state.setProjectList)

  useEffect(() => {
    allProjects().then(setProjectList)
  }, [])

  return (
    <div className="flex flex-col justify-between gap-2 md:flex-row">
      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
        <TaskInput className="cursor-pointer rounded-xs md:w-44" />
        <ProjectSelect className="cursor-pointer rounded-xs md:w-44" />
        <TaskTypeSelect className="cursor-pointer rounded-xs md:w-44" />
        <EpicInput className="cursor-pointer rounded-xs md:w-44" />
        <DevSelect className="cursor-pointer rounded-xs md:w-44" />
      </div>
      <div className="flex justify-end">
        <ButtonCreateTasks className="h-[40px] w-44 cursor-pointer rounded-xs" />
      </div>
    </div>
  )
}
