import {Button} from "@/components/ui/button.tsx";
import {useTasksStore} from "@/store/tasks-store.ts";
import type {PropsWithChildren} from "react";

type ButtonCreateTasksProps = {
  className: string
}

export const ButtonCreateTasks = ({ className }: PropsWithChildren<ButtonCreateTasksProps>) => {
  const tasks = useTasksStore((state) => state.tasks);
  const setStatusTask = useTasksStore((state) => state.setStatusTask);
  const setUrlTask = useTasksStore((state) => state.setUrlTask);

  const handlerCreateTask = () => {
    for (const { disabled, ...task } of tasks) {
      if (disabled) continue

      setStatusTask(task.id, 'IN_PROGRESS')

      const body = JSON.stringify(task)
      fetch('/api/tasks', {method: 'POST', body})
        .then(data => data.json())
        .then(({id, url}) => {
          setUrlTask(id, url)
          setStatusTask(id, 'CREATED')
        })
        .catch(console.error)
    }
  }

  return (
    <Button onClick={handlerCreateTask} className="flex-1 bg-blue-500 hover:bg-blue-800 hover:shadow">Create Tasks</Button>
  )
}
