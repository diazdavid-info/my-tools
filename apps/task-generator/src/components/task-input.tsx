import { Input } from "@/components/ui/input.tsx";
import type {ChangeEvent, PropsWithChildren} from "react";
import { useTasksStore } from "@/store/tasks-store.ts";

type TaskInputProps = {
  className: string
}

export const TaskInput = ({ className }: PropsWithChildren<TaskInputProps>) => {
  const createTask = useTasksStore((state) => state.createTask);

  const handleOnBlur = (event: ChangeEvent<HTMLInputElement>) => {
    fetch(`/api/tasks/${event.target.value}`)
      .then((response) => response.json())
      .then((json) => {
        createTask(JSON.stringify(json));
      })
      .catch(console.error);
  };

  return (
    <Input className={className} onBlur={handleOnBlur} type="text" placeholder="Jira Analisis Task" />
  );
};
