import { Button } from '@/components/ui/button.tsx'
import { useTasksStore } from '@/store/tasks-store.ts'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

type ButtonRefreshTasksProps = {
  className: string
}

export const ButtonRefreshTasks = ({ className }: ButtonRefreshTasksProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const taskKey = useTasksStore((state) => state.taskKey)
  const refreshTasks = useTasksStore((state) => state.refreshTasks)

  const handleRefreshTasks = () => {
    const key = taskKey.trim()
    if (!key) return

    setIsRefreshing(true)
    refreshTasks()
      .catch(console.error)
      .finally(() => setIsRefreshing(false))
  }

  return (
    <Button
      type="button"
      variant="outline"
      aria-label="Refresh tasks"
      title="Refresh tasks"
      onClick={handleRefreshTasks}
      disabled={!taskKey.trim() || isRefreshing}
      className={className}
    >
      <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
    </Button>
  )
}
