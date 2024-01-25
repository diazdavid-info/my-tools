import React from "react";
import {useTasksStore} from "@/store/tasks-store.ts";
import { Textarea as TextareaUi } from '@/components/ui/textarea.tsx'

export const Textarea = () => {
  const { createTask } = useTasksStore((state) => state)

  const handleOnChangeContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    createTask(event.target.value)
  }

  return (
    <TextareaUi
      className="resize-none overflow-hidden"
      onChange={handleOnChangeContent}
      placeholder="Type your message here."
    />
  )
}
