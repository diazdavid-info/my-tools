import { create } from "zustand";
import type { Task } from "@/types/task";
import { jiraTasksToTasks } from "@/lib/converter.ts";
import type { ItemList, State } from "@/types/tasks-store";

const updatePropTask = <T>(
  id: number,
  prop: string,
  value: T,
  tasks: Task[],
): Task[] => {
  const taskFound = tasks.find(({ id: taskId }) => taskId === id);
  if (!taskFound) return [];

  const newTask: Task = { ...taskFound, [prop]: value };
  const restTasks = tasks.filter(({ id: taskId }) => taskId !== id);
  return [newTask, ...restTasks].sort(
    (a: Task, b: Task) => a.id - b.id,
  );
};

const initialState = {
  devItemList: [
    { key: "Backend", value: "Backend" },
    { key: "Frontend", value: "Frontend" },
    { key: "Tech", value: "Tech" },
  ],
  projectItemList: [
    { key: "10000", value: "BookingApp (BOOK)" },
    { key: "10001", value: "API (API)" },
    { key: "10002", value: "Admin (ADM)" },
  ],
  typeItemList: [
    { key: "10002", value: "Task" },
    { key: "10009", value: "Spike" },
  ],

  content: null,
  tasks: [],
  tasksOptions: {
    dev: undefined,
    epic: undefined,
    project: undefined,
    type: undefined,
  },
};

export const useTasksStore = create<State>((set) => ({
  ...initialState,

  createTask: (content: string) =>
    set(({ tasksOptions }) => {
      try {
        const jsonContent = JSON.parse(content);
        const parent = jsonContent.fields.parent.key;
        const tasks = jiraTasksToTasks(jsonContent);

        return {
          tasks,
          tasksOptions: { ...tasksOptions, epic: parent },
          content: jsonContent,
        };
      } catch (e: any) {
        console.log(e.message);
        return {};
      }
    }),
  setDev: (value: string) =>
    set(({ tasks, tasksOptions }) => {
      const newTasks = tasks.map((task) => ({ ...task, dev: value }));

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, dev: value },
      };
    }),
  setEpic: (value: string) =>
    set(({ tasks, tasksOptions }) => {
      const newTasks = tasks.map((task) => ({ ...task, epic: value }));

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, epic: value },
      };
    }),
  setProject: (value: string) =>
    set(({ tasks, tasksOptions }) => {
      const newTasks = tasks.map((task) => ({ ...task, project: value }));

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, project: value },
      };
    }),
  setProjectList: (itemList: ItemList[]) =>
    set(() => {
      return {
        projectItemList: itemList,
      };
    }),
  setType: (value: string) =>
    set(({ tasks, tasksOptions }) => {
      const newTasks = tasks.map((task) => ({ ...task, type: value }));

      return {
        tasks: newTasks,
        tasksOptions: { ...tasksOptions, type: value },
      };
    }),
  setPointsTask: (id: number, points: number) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, "points", points, tasks);

      return {
        tasks: allTasks,
      };
    });
  },
  setDevTask: (id: number, dev: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, "dev", dev, tasks);

      return {
        tasks: allTasks,
      };
    });
  },
  setProjectTask: (id: number, project: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, "project", project, tasks);

      return {
        tasks: allTasks,
      };
    });
  },
  setTypeTask: (id: number, type: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, "type", type, tasks);

      return {
        tasks: allTasks,
      };
    });
  },
  setEpicTask: (id: number, epic: string) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, "epic", epic, tasks);

      return {
        tasks: allTasks,
      };
    });
  },
  setDisabledTask: (id: number, disabled: boolean) => {
    set(({ tasks }) => {
      const allTasks = updatePropTask(id, "disabled", disabled, tasks);

      return {
        tasks: allTasks,
      };
    });
  },
}));
