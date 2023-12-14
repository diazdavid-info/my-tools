import { describe, expect, it } from 'vitest'
import { fixture } from '@/lib/__tests__/fixture.ts'
import { jiraTasksToTasks } from '@/lib/converter.ts'

describe('converter', () => {
  describe('htmlElementToTasks', () => {
    it('Should generate task with title', () => {
      const [firstTask, secondTask] = jiraTasksToTasks(fixture)

      expect(firstTask.title).toBe('Estudiar documentación de COAM')
      expect(secondTask.title).toBe('Registrar templates en mailer')
    })
    it('Should generate task with points', () => {
      const [firstTask, secondTask] = jiraTasksToTasks(fixture)

      expect(firstTask.points).toBe(4)
      expect(secondTask.points).toBe(2)
    })
  })
})
