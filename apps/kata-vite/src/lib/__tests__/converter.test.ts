import { expect, it, describe } from 'vitest'
import { Task } from '@/types/task'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'

type LiData = {
  p: {
    span: string
  }
  ul?: {
    li: LiData[] | LiData
  }
}

type XMLData = {
  ul: {
    li: LiData | LiData[]
  }
}

const processContent = (data: LiData): any => {
  console.log(JSON.stringify(data))
  const content = []
  if (data.p?.span) {
    content.push({ type: 'text', content: data.p.span })
  }
  if (data.ul?.li && !Array.isArray(data.ul.li)) {
    content.push({ type: 'list', content: processContent(data.ul.li) })
  }
  if (Array.isArray(data.ul) && data.ul.length > 0) {
    content.push({
      type: 'list',
      content: data.ul.map((l) => processContent(l.li)).flat()
    })
  }

  return content
}

const processTitle = (data: LiData): string => {
  const { p } = data
  const { span } = p
  const contentTitle = span || '→ 0'
  const [title] = contentTitle.split('→')

  return title
}

const processPoints = (data: LiData): number => {
  const { p } = data
  const { span } = p
  const contentTitle = span || '→ 0'
  const [, points] = contentTitle.split('→')

  return parseInt(points?.trim())
}

const htmlElementToTasks = (data: string): Task[] => {
  const parser = new XMLParser()
  const jObj = parser.parse(data) as XMLData
  const { ul } = jObj
  const { li: lis } = ul

  const tasks: Task[] = []

  lis.forEach((li) => {
    const title = processTitle(li)
    const points = processPoints(li)
    const content = processContent(li)

    tasks.push({
      id: '',
      title,
      points,
      content
    })
  })

  return tasks
}

describe('converter', () => {
  describe('htmlElementToTasks', () => {
    it('Should generate task with title', () => {
      const html = buildXML({
        ul: {
          li: [{ p: { span: 'Title 1' } }, { p: { span: 'Title 2' } }]
        }
      })
      const [firstTask, secondTask] = htmlElementToTasks(html)

      expect(firstTask.title).toBe('Title 1')
      expect(secondTask.title).toBe('Title 2')
    })
    it('Should generate task with points', () => {
      const html = buildXML({ ul: { li: [{ p: { span: 'Title 1 → 1' } }, { p: { span: 'Title 2 → 2' } }] } })
      const [firstTask, secondTask] = htmlElementToTasks(html)

      expect(firstTask.points).toBe(1)
      expect(secondTask.points).toBe(2)
    })
    it('Should generate task with content when has one depth', () => {
      const html = buildXML({
        ul: {
          li: [{ p: { span: 'Title 1 → 1' }, ul: { li: [{ p: { span: 'Child 1' } }] } }, { p: { span: 'Title 2 → 2' } }]
        }
      })
      const [firstTask, secondTask] = htmlElementToTasks(html)

      expect(firstTask.content).toEqual([
        {
          type: 'text',
          content: 'Title 1 → 1'
        },
        {
          type: 'list',
          content: [
            {
              type: 'text',
              content: 'Child 1'
            }
          ]
        }
      ])
      expect(secondTask.content).toEqual([
        {
          type: 'text',
          content: 'Title 2 → 2'
        }
      ])
    })
    it('Should generate task with content when has more that one depth', () => {
      const html = buildXML({
        ul: {
          li: [
            {
              p: { span: 'Depth 1 → 1' },
              ul: [
                { li: { p: { span: 'Depth 1 1' }, ul: { li: { p: { span: 'Depth 1 1 1' } } } } },
                { li: { p: { span: 'Depth 1 2' } } }
              ]
            },
            { p: { span: 'Depth 2 → 2' } }
          ]
        }
      })

      console.log(html)

      const [firstTask, secondTask] = htmlElementToTasks(html)

      expect(firstTask.content).toEqual([
        {
          type: 'text',
          content: 'Depth 1 → 1'
        },
        {
          type: 'list',
          content: [
            {
              type: 'text',
              content: 'Depth 1 1'
            },
            {
              type: 'list',
              content: [
                {
                  type: 'text',
                  content: 'Depth 1 1 1'
                }
              ]
            },
            {
              type: 'text',
              content: 'Depth 1 2'
            }
          ]
        }
      ])
      expect(secondTask.content).toEqual([
        {
          type: 'text',
          content: 'Depth 2 → 2'
        }
      ])
    })

    const buildXML = (data: any) => {
      const builder = new XMLBuilder()
      return builder.build(data)
    }
  })
})
