import { ChangeEvent, FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useTasksStore } from '@/store/tasks-store.ts'
import { CardInputOption } from '@/components/card-input-option.tsx'
import { CardSelectOption } from '@/components/card-select-option.tsx'

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
    setEpicTask
  } = useTasksStore((state) => state)

  const handlePointsChange = (id: string) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === '' ? '0' : event.target.value
      setPointsTask(id, parseInt(value))
    }
  }

  const handleDevChange = (id: string) => {
    return (event: string) => {
      setDevTask(id, event)
    }
  }

  const handleProjectChange = (id: string) => {
    return (event: string) => {
      setProjectTask(id, event)
    }
  }

  const handleTypeChange = (id: string) => {
    return (event: string) => {
      setTypeTask(id, event)
    }
  }

  const handleEpicChange = (id: string) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setEpicTask(id, event.target.value)
    }
  }

  return tasks.map(({ id, title, points, dev, epic, project, type, content }) => (
    <Card key={id}>
      <CardHeader>
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
        <code className="max-h-64 overflow-hidden block">{content}</code>
      </CardContent>
    </Card>
  ))
}
