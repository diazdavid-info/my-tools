import { type ChangeEvent, type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useTasksStore } from '@/store/tasks-store.ts'
import { CardInputOption } from '@/components/card-input-option.tsx'
import { CardSelectOption } from '@/components/card-select-option.tsx'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'
import type {TaskStatus} from "@/types/task";

type CardListProp = object

export const CardList: FC<CardListProp> = () => {
  const {
    tasks,
    devItemList,
    projectItemList,
    typeItemList,
    setPointsTask,
    setDevTask,
    setProjectTask,
    setTypeTask,
    setEpicTask,
    setDisabledTask
  } = useTasksStore((state) => state)

  const handlePointsChange = (id: number) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === '' ? '0' : event.target.value
      setPointsTask(id, parseInt(value))
    }
  }

  const handleDevChange = (id: number) => {
    return (event: string) => {
      setDevTask(id, event)
    }
  }

  const handleProjectChange = (id: number) => {
    return (event: string) => {
      setProjectTask(id, event)
    }
  }

  const handleTypeChange = (id: number) => {
    return (event: string) => {
      setTypeTask(id, event)
    }
  }

  const handleEpicChange = (id: number) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setEpicTask(id, event.target.value)
    }
  }

  const handleSkipChange = (id: number) => {
    return (event: string) => {
      setDisabledTask(id, event === 'skip')
    }
  }

  const colorStatus = (isDisabled: boolean, status: TaskStatus) => {
    if(isDisabled) return 'bg-gray-500'
    if(status === 'IN_PROGRESS') return 'bg-gray-300 opacity-20'
    if(status === 'CREATED') return 'bg-blue-200'

    return ''
  }

  return tasks.map(({ id, title, points, dev, epic, project, type, disabled, status }) => (
    <Card key={id} className={`${colorStatus(disabled, status)}`}>
      <CardHeader>
        <ToggleGroup onValueChange={handleSkipChange(id)} value={disabled ? 'skip' : ''} type="single">
          <ToggleGroupItem value="skip">Omitir</ToggleGroupItem>
          <ToggleGroupItem value="only">Sólo</ToggleGroupItem>
        </ToggleGroup>
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          <CardInputOption value={points.toString()} handleValueChange={handlePointsChange(id)} />
          <CardSelectOption value={project} items={projectItemList} handleValueChange={handleProjectChange(id)} />
          <CardSelectOption value={type} items={typeItemList} handleValueChange={handleTypeChange(id)} />
          <CardInputOption value={epic ?? ''} handleValueChange={handleEpicChange(id)} />
          <CardSelectOption value={dev} items={devItemList} handleValueChange={handleDevChange(id)} />
        </div>
      </CardHeader>
      <CardContent className="text-sm">
      </CardContent>
    </Card>
  ))
}
