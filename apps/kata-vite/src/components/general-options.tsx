import { ProjectSelect } from '@/components/project-select.tsx'
import { TokenInput } from '@/components/token-input.tsx'
import { TaskTypeSelect } from '@/components/task-type-select.tsx'
import { EpicInput } from '@/components/epic-input.tsx'
import { DevSelect } from '@/components/dev-select.tsx'
import { DomainInput } from '@/components/domain-input.tsx'

export const GeneralOptions = () => {
  return (
    <div className="flex flex-row gap-2">
      <DomainInput className="flex-1" />
      <TokenInput className="flex-1" />
      <ProjectSelect className="flex-1" />
      <TaskTypeSelect className="flex-1" />
      <EpicInput className="flex-1" />
      <DevSelect className="flex-1" />
    </div>
  )
}
