import {Button} from "@/components/ui/button.tsx";
import {useTasksStore} from "@/store/tasks-store.ts";
import type {PropsWithChildren} from "react";

type ButtonCreateTasksProps = {
  className: string
}

export const ButtonCreateTasks = ({ className }: PropsWithChildren<ButtonCreateTasksProps>) => {
  const tasks = useTasksStore((state) => state.tasks);

  const handlerCreateTask = () => {
    for (const { disabled, ...task } of tasks) {
      if (disabled) continue

      const body = JSON.stringify(task)
      fetch('/api/tasks', {method: 'POST', body})
        .then(data => data.json())
        .then(console.log)
        .catch(console.error)
    }
  }

  return (
    <Button onClick={handlerCreateTask} className="flex-1 bg-blue-500 hover:bg-blue-800 hover:shadow">Create Tasks</Button>
  )
}
