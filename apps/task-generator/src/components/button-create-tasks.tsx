import {Button} from "@/components/ui/button.tsx";
import {useTasksStore} from "@/store/tasks-store.ts";
import type {PropsWithChildren} from "react";

type ButtonCreateTasksProps = {
  className: string
}

export const ButtonCreateTasks = ({ className }: PropsWithChildren<ButtonCreateTasksProps>) => {
  const tasks = useTasksStore((state) => state.tasks);

  const handlerCreateTask = () => {
    console.log({...tasks})
  }

  return (
    <Button onClick={handlerCreateTask} className="flex-1 bg-blue-500 hover:bg-blue-800 hover:shadow">Create Tasks</Button>
  )
}
