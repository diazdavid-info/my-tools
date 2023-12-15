import { useTasksStore } from '@/store/tasks-store.ts'
import { ClipboardIcon } from '@/components/icons.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { Toaster } from '@/components/ui/toaster.tsx'

export const Command = () => {
  const command = useTasksStore((state) => state.command)
  const { toast } = useToast()

  const handleClipboard = () => {
    navigator.clipboard.writeText(command).catch()
    toast({
      title: 'Command copied'
    })
  }

  return (
    <div className="flex flex-col items-start">
      <Button variant="link" onClick={handleClipboard}>
        <ClipboardIcon />
      </Button>
      <code className="text-sm p-2">{command}</code>
      <Toaster />
    </div>
  )
}
