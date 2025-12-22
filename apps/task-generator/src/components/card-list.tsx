import { useTasksStore } from '@/store/tasks-store.ts'
import { CardSelectOption } from '@/components/card-select-option.tsx'
import { CardInputOption } from '@/components/card-input-option.tsx'
import type { ChangeEvent } from 'react'
import { ExternalLink, Power, PowerOff } from 'lucide-react'
import type { TaskStatus } from '@/types/task'

export const CardList = () => {
  const tasks = useTasksStore((state) => state.tasks)
  const projectItemList = useTasksStore((state) => state.projectItemList)
  const typeItemList = useTasksStore((state) => state.typeItemList)
  const devItemList = useTasksStore((state) => state.devItemList)
  const setProjectTask = useTasksStore((state) => state.setProjectTask)
  const setPointsTask = useTasksStore((state) => state.setPointsTask)
  const setTypeTask = useTasksStore((state) => state.setTypeTask)
  const setDevTask = useTasksStore((state) => state.setDevTask)
  const setDisabledTask = useTasksStore((state) => state.setDisabledTask)

  const handlePointsChange = (id: number) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === '' ? '0' : event.target.value
      setPointsTask(id, parseInt(value))
    }
  }

  const handleProjectChange = (id: number) => {
    return (event: string) => {
      setProjectTask(id, event)
    }
  }

  const handleTypeChange = (id: number) => {
    return (event: string) => {
      setTypeTask(id, event)
    }
  }

  const handleDevChange = (id: number) => {
    return (event: string) => {
      setDevTask(id, event)
    }
  }

  const handleSkipChange = (id: number, disabled: boolean) => {
    return () => {
      setDisabledTask(id, !disabled)
    }
  }

  const colorStatus = (isDisabled: boolean, status: TaskStatus) => {
    if (isDisabled) return 'bg-gray-500 opacity-50'
    if (status === 'IN_PROGRESS') return 'bg-white opacity-20'
    if (status === 'CREATED') return 'bg-blue-200'

    return ''
  }

  return tasks.map((task) => (
    <article
      key={task.id}
      className={` ${colorStatus(task.disabled, task.status)} flex flex-col justify-between gap-4 rounded border border-gray-100 px-3 py-4 shadow-sm transition-shadow hover:shadow-md`}
    >
      <header className="flex h-full flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-x-6">
          <h2 className="line-clamp-2 font-semibold" title={task.title}>
            {task.title}
          </h2>
          <div className="flex justify-end">
            <button
              className="group flex cursor-pointer items-center justify-center rounded p-1 transition-colors hover:bg-gray-100"
              onClick={handleSkipChange(task.id, task.disabled)}
            >
              {task.disabled ? (
                <PowerOff
                  className="inline size-5 text-white group-hover:text-black"
                  strokeWidth="1.5"
                />
              ) : (
                <Power className="inline size-5" strokeWidth="1.5" />
              )}
            </button>
            <a
              href={task.url}
              target="_blank"
              rel="noreferrer"
              className={`${task.url === '' ? 'cursor-not-allowed opacity-50' : ''} flex items-center justify-center rounded p-1 transition-colors hover:bg-gray-100`}
            >
              <ExternalLink className="inline size-5" strokeWidth="1.5" />
            </a>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm font-light">
          <p className="w-full truncate overflow-hidden rounded-xs bg-green-300 px-1 py-0.5 text-nowrap">
            {task.epicSummary}
          </p>
        </div>
      </header>
      <footer className="flex flex-col gap-2 text-sm font-light">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-light">
          <CardSelectOption
            value={task.dev}
            items={devItemList}
            handleValueChange={handleDevChange(task.id)}
          />
          <CardSelectOption
            value={task.type}
            items={typeItemList}
            handleValueChange={handleTypeChange(task.id)}
          />
          <CardInputOption
            value={task.points.toString()}
            handleValueChange={handlePointsChange(task.id)}
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-sm font-light">
          <CardSelectOption
            value={task.project}
            items={projectItemList}
            handleValueChange={handleProjectChange(task.id)}
          />
        </div>
      </footer>
    </article>
  ))
}
