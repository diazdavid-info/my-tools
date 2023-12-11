import { ProjectSelect } from '@/components/ui/project-select.tsx'
import { TokenInput } from '@/components/ui/token-input.tsx'
import { TaskTypeSelect } from '@/components/ui/task-type-select.tsx'
import { EpicInput } from '@/components/ui/epic-input.tsx'
import { DevSelect } from '@/components/ui/dev-select.tsx'
import { DomainInput } from '@/components/ui/domain-input.tsx'

export const CardOptions = () => {
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
