import { Input } from '@/components/ui/input.tsx'
import { ChangeEvent, PropsWithChildren } from 'react'
import { useTasksStore } from '@/store/tasks-store.ts'

type TokenInputProps = {
  className: string
}

export const DomainInput = ({ className }: PropsWithChildren<TokenInputProps>) => {
  const addDomain = useTasksStore((state) => state.addDomain)
  const domain = useTasksStore((state) => state.domain)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    addDomain(event.target.value)
  }

  return <Input onChange={handleChange} value={domain} type="text" placeholder="Jira Domain" className={className} />
}
