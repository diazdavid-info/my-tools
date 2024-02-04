import { Input } from "@/components/ui/input.tsx";
import type { ChangeEvent } from "react";
import { useTasksStore } from "@/store/tasks-store.ts";

export const TaskInput = () => {
  const { createTask } = useTasksStore((state) => state);

  const handleOnBlur = (event: ChangeEvent<HTMLInputElement>) => {
    fetch(`/api/tasks/${event.target.value}`)
      .then((response) => response.json())
      .then((json) => {
        createTask(JSON.stringify(json));
      })
      .catch(console.error);
  };

  return (
    <Input onBlur={handleOnBlur} type="text" placeholder="Jira Analisis Task" />
  );
};
