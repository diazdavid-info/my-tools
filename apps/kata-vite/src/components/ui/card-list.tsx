import { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useTasksStore } from '@/store/tasks.ts'
import { Badge } from '@/components/ui/badge.tsx'

type CardListProp = object

export const CardList: FC<CardListProp> = () => {
  const tasks = useTasksStore((state) => state.tasks)

  return tasks.map(({ id, title, points, dev, epic, project, type, content }) => (
    <Card key={id}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          <Badge variant="outline">{points}</Badge>
          <Badge variant="outline">{project}</Badge>
          <Badge variant="outline">{type}</Badge>
          <Badge variant="outline">{epic}</Badge>
          <Badge variant="outline">{dev}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {content.map((line: string) => (
          <p key={line}>- {line}</p>
        ))}
      </CardContent>
    </Card>
  ))
}
