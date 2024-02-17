import { ProjectSelect } from "@/components/project-select.tsx";
import { TaskTypeSelect } from "@/components/task-type-select.tsx";
import { EpicInput } from "@/components/epic-input.tsx";
import { DevSelect } from "@/components/dev-select.tsx";
import { useEffect } from "react";
import { useTasksStore } from "@/store/tasks-store.ts";
import { allProjects } from "@/services/project-service.ts";
import {TaskInput} from "@/components/task-input.tsx";
import {Button} from "@/components/ui/button.tsx";

export const GeneralOptions = () => {
  const setProjectList = useTasksStore((state) => state.setProjectList);
  const tasks = useTasksStore((state) => state.tasks);

  useEffect(() => {
    allProjects().then(setProjectList);
  }, []);

  const handlerCreateTask = () => {
    console.log({...tasks})
  }

  return (
    <div className="flex flex-row gap-2">
      <TaskInput className="flex-1"/>
      <ProjectSelect className="flex-1" />
      <TaskTypeSelect className="flex-1" />
      <EpicInput className="flex-1" />
      <DevSelect className="flex-1" />
      <Button onClick={handlerCreateTask} className="flex-1 bg-blue-500 hover:bg-blue-800 hover:shadow">Create Tasks</Button>
    </div>
  );
};
