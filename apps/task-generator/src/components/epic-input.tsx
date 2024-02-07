import { Input } from '@/components/ui/input.tsx'
import {type ChangeEvent, type PropsWithChildren, useEffect, useState} from "react";
import { useTasksStore } from '@/store/tasks-store.ts'

type EpicInput = {
  className: string
}

export const EpicInput = ({ className }: PropsWithChildren<EpicInput>) => {
  const setEpic = useTasksStore((state) => state.setEpic)
  const epic = useTasksStore((state) => state.tasksOptions.epic)
  const [epicValue, setEpicValue] = useState('')

  useEffect(() => {
    if(epic == null) return
    setEpicValue(epic)
  }, [epic])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEpic(event.target.value)
  }

  return <Input onChange={handleChange} type="text" placeholder="ID Epic" className={className} value={epicValue} />
}
