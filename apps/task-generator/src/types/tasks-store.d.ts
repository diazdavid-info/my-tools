import { Task } from "@/types/task";
import { JiraTask } from "@/lib/__tests__/fixture.ts";

type TaskOptions = {
  dev?: string;
  epic?: string;
  project?: string;
  type?: string;
};

type ItemList = {
  key: string;
  value: string;
};

type State = {
  devItemList: ItemList[];
  projectItemList: ItemList[];
  typeItemList: ItemList[];

  tasks: Task[];
  content: JiraTask | null;
  tasksOptions: TaskOptions;

  createTask: (content: string) => void;
  setDev: (value: string) => void;
  setEpic: (value: string) => void;
  setProject: (value: string) => void;
  setProjectList: (itemList: ItemList[]) => void;
  setType: (value: string) => void;

  setPointsTask: (id: number, points: number) => void;
  setDevTask: (id: number, dev: string) => void;
  setProjectTask: (id: number, dev: string) => void;
  setTypeTask: (id: number, dev: string) => void;
  setEpicTask: (id: number, dev: string) => void;
  setDisabledTask: (id: number, disabled: boolean) => void;
};
