import { Input } from '@/components/ui/input.tsx'
import { ChangeEvent, PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'

type TokenInputProps = {
  className: string
}

export const TokenInput = ({ className }: PropsWithChildren<TokenInputProps>) => {
  const addToken = useTasksStore((state) => state.addToken)
  const token = useTasksStore((state) => state.token)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    addToken(event.target.value)
  }

  return <Input onChange={handleChange} value={token} type="text" placeholder="Jira Token" className={className} />
}
