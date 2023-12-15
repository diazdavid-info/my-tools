import { ChangeEvent, FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useTasksStore } from '@/store/tasks.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { CardInputOption } from '@/components/ui/card-input-option.tsx'
import { CardSelectOption } from '@/components/ui/card-select-option.tsx'

type CardListProp = object

export const CardList: FC<CardListProp> = () => {
  const { tasks, setPointsTask, devItemList, setDevTask } = useTasksStore((state) => state)

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

  return tasks.map(({ id, title, points, dev, epic, project, type, content }) => (
    <Card key={id}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          <CardInputOption value={points.toString()} handleValueChange={handlePointsChange(id)} />
          <Popover>
            <PopoverTrigger>
              <Badge variant="outline">{project}</Badge>
            </PopoverTrigger>
            <PopoverContent>Project</PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>
              <Badge variant="outline">{type}</Badge>
            </PopoverTrigger>
            <PopoverContent>Project</PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>
              <Badge variant="outline">{epic}</Badge>
            </PopoverTrigger>
            <PopoverContent>Project</PopoverContent>
          </Popover>
          <CardSelectOption value={dev} items={devItemList} handleValueChange={handleDevChange(id)} />
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <code className="max-h-64 overflow-hidden block">{content}</code>
      </CardContent>
    </Card>
  ))
}
