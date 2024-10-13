import {useTasksStore} from "@/store/tasks-store.ts";
import {CardSelectOption} from "@/components/card-select-option-2.tsx";
import {CardInputOption} from "@/components/card-input-option-2.tsx";
import type {ChangeEvent} from "react";

export const CardList2 = () => {
  const tasks = useTasksStore((state) => state.tasks)
  const projectItemList = useTasksStore((state) => state.projectItemList)
  const typeItemList = useTasksStore((state) => state.typeItemList)
  const devItemList = useTasksStore((state) => state.devItemList)
  const setProjectTask = useTasksStore((state) => state.setProjectTask)
  const setPointsTask = useTasksStore((state) => state.setPointsTask)
  const setTypeTask = useTasksStore((state) => state.setTypeTask)
  const setDevTask = useTasksStore((state) => state.setDevTask)

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

  return tasks.map((task) => (
    <article key={task.id} className="border rounded-lg shadow-sm py-4 px-3 flex flex-col gap-4 justify-between bg-white">
      <header className="flex flex-col h-full justify-between">
        <h2 className="font-semibold">{task.title}</h2>
        <div className="flex flex-col items-start gap-2 text-sm font-light">
          <p className="rounded w-full bg-green-300 py-0.5 px-1 overflow-hidden text-nowrap truncate">{task.epicSummary}</p>
        </div>
      </header>
      <footer className="flex flex-col gap-2 text-sm font-light">
        <div>
          <CardSelectOption value={task.dev} items={devItemList} handleValueChange={handleDevChange(task.id)} />
        </div>
        <div className="flex gap-2 justify-between items-center text-sm font-light">
          <CardSelectOption value={task.type} items={typeItemList} handleValueChange={handleTypeChange(task.id)}/>
          <CardSelectOption value={task.project} items={projectItemList}
                            handleValueChange={handleProjectChange(task.id)}/>
          <CardInputOption value={task.points.toString()} handleValueChange={handlePointsChange(task.id)}/>
        </div>

      </footer>
    </article>
  ))
}
