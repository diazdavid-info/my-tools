import { ProjectSelect } from "@/components/project-select.tsx";
import { TaskTypeSelect } from "@/components/task-type-select.tsx";
import { EpicInput } from "@/components/epic-input.tsx";
import { DevSelect } from "@/components/dev-select.tsx";
import { useEffect } from "react";
import { useTasksStore } from "@/store/tasks-store.ts";
import { allProjects } from "@/services/project-service.ts";

export const GeneralOptions = () => {
  const setProjectList = useTasksStore((state) => state.setProjectList);

  useEffect(() => {
    allProjects().then(setProjectList);
  }, []);

  return (
    <div className="flex flex-row gap-2">
      <ProjectSelect className="flex-1" />
      <TaskTypeSelect className="flex-1" />
      <EpicInput className="flex-1" />
      <DevSelect className="flex-1" />
    </div>
  );
};
