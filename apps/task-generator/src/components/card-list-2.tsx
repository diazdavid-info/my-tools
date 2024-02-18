import {useTasksStore} from "@/store/tasks-store.ts";

export const CardList2 = () => {
  const tasks = useTasksStore((state) => state.tasks)

  return tasks.map((task) => (
    <article key={task.id} className="border rounded-lg shadow-sm py-4 px-2 flex flex-col gap-2 justify-between">
      <h2 className="font-semibold">{task.title}</h2>
      <div className="flex flex-col gap-2">
        <p className="rounded w-full bg-red-400 py-0.5 px-1 text-sm overflow-hidden text-nowrap truncate">[Issues+Bugs] Swimlane del Service Desk {task.epic}</p>
        <p className="text-sm">Backend {task.dev}</p>
      </div>
      <footer className="flex gap-2 justify-between items-center text-sm">
        <span>{task.type}</span>
        <span>{task.project}</span>
        <span className="border rounded-full px-2">{task.points}</span>
      </footer>
    </article>
  ))
}
