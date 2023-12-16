import { Input } from '@/components/ui/input.tsx'
import { ChangeEvent, PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'

type EpicInput = {
  className: string
}

export const EpicInput = ({ className }: PropsWithChildren<EpicInput>) => {
  const setEpic = useTasksStore((state) => state.setEpic)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEpic(event.target.value)
  }

  return <Input onChange={handleChange} type="text" placeholder="ID Epic" className={className} />
}
