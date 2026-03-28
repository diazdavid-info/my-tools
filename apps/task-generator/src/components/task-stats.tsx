import { CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useTasksStore } from '@/store/tasks-store.ts'

const numberFormatter = new Intl.NumberFormat('es-ES')

export const TaskStats = () => {
  const tasks = useTasksStore((state) => state.tasks)

  const totalTasks = tasks.length
  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0)

  return (
    <div className="grid gap-3 md:inline-grid md:grid-flow-col md:auto-cols-fr">
      <article className="rounded border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md md:w-full">
        <CardHeader className="space-y-0 px-3 py-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Tareas importadas</p>
            <CardTitle className="mt-1.5 text-3xl font-semibold text-slate-900">
              {numberFormatter.format(totalTasks)}
            </CardTitle>
          </div>
        </CardHeader>
      </article>

      <article className="rounded border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md md:w-full">
        <CardHeader className="space-y-0 px-3 py-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Puntos totales</p>
            <CardTitle className="mt-1.5 text-3xl font-semibold text-slate-900">
              {numberFormatter.format(totalPoints)}
            </CardTitle>
          </div>
        </CardHeader>
      </article>
    </div>
  )
}
