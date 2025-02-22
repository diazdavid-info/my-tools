import {useTasksStore} from "@/store/tasks-store.ts";
import {CardSelectOption} from "@/components/card-select-option-2.tsx";
import {CardInputOption} from "@/components/card-input-option-2.tsx";
import type {ChangeEvent} from "react";
import {Pencil, Power, PowerOff} from "lucide-react";
import type {TaskStatus} from "@/types/task";
import { Button } from "./ui/button";

export const CardList2 = () => {
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
    if(isDisabled) return 'bg-gray-500 opacity-50'
    if(status === 'IN_PROGRESS') return 'bg-white opacity-20'
    if(status === 'CREATED') return 'bg-blue-200'

    return ''
  }

  return tasks.map((task) => (
    <article key={task.id} className={`${colorStatus(task.disabled, task.status)} border rounded-lg shadow-sm py-4 px-3 flex flex-col gap-4 justify-between`}>
      <header className="flex flex-col h-full justify-between gap-2">
        <div className="flex flex-col items-end">
          <Button variant="ghost" className="px-0 py-0 gap-0 cursor-pointer hover:bg-transparent" onClick={handleSkipChange(task.id, task.disabled)}>
            {task.disabled ?
              <PowerOff className="size-5 inline text-white" strokeWidth="1.5" /> :
              <Power className="size-5 inline" strokeWidth="1.5" />
            }
          </Button>
        </div>
        <h2 className="font-semibold truncate" title={task.title}>{task.title}</h2>
        <div className="flex flex-col items-start gap-2 text-sm font-light">
          <p className="rounded w-full bg-green-300 py-0.5 px-1 overflow-hidden text-nowrap truncate">{task.epicSummary}</p>
        </div>
      </header>
      <footer className="flex flex-col gap-2 text-sm font-light">
        <div className="flex flex-wrap gap-2 justify-between items-center text-sm font-light">
          <CardSelectOption value={task.dev} items={devItemList} handleValueChange={handleDevChange(task.id)} />
          <CardSelectOption value={task.type} items={typeItemList} handleValueChange={handleTypeChange(task.id)}/>
          <CardInputOption value={task.points.toString()} handleValueChange={handlePointsChange(task.id)}/>
        </div>
        <div className="flex gap-2 justify-between items-center text-sm font-light">
          <CardSelectOption value={task.project} items={projectItemList}
                            handleValueChange={handleProjectChange(task.id)}/>
        </div>
      </footer>
    </article>
  ))
}
