import { ProjectSelect } from "@/components/project-select.tsx";
import { TaskTypeSelect } from "@/components/task-type-select.tsx";
import { EpicInput } from "@/components/epic-input.tsx";
import { DevSelect } from "@/components/dev-select.tsx";
import { useEffect } from "react";
import { useTasksStore } from "@/store/tasks-store.ts";
import { allProjects } from "@/services/project-service.ts";
import {TaskInput} from "@/components/task-input.tsx";
import {ButtonCreateTasks} from "@/components/button-create-tasks.tsx";

export const GeneralOptions = () => {
  const setProjectList = useTasksStore((state) => state.setProjectList);

  useEffect(() => {
    allProjects().then(setProjectList);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <TaskInput className="flex-1 rounded-xs cursor-pointer"/>
      <ProjectSelect className="flex-1 rounded-xs cursor-pointer" />
      <TaskTypeSelect className="flex-1 rounded-xs cursor-pointer" />
      <EpicInput className="flex-1 rounded-xs cursor-pointer" />
      <DevSelect className="flex-1 rounded-xs cursor-pointer" />
      <ButtonCreateTasks className="flex-1 rounded-xs h-auto cursor-pointer" />
    </div>
  );
};
