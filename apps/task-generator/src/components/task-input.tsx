import {Input} from "@/components/ui/input.tsx";
import type {ChangeEvent} from "react";


export const TaskInput = () => {
  const handleOnBlur = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
    fetch(`/api/tasks/${event.target.value}`).then(response => response.json()).then(console.log)
  }

  return <Input onBlur={handleOnBlur} type="text" placeholder="Jira Analisis Task" />
}
