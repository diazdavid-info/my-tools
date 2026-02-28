import z from 'zod'
import { tool } from 'ai'
import prompts from 'prompts'
import { logTools } from '../../shared/logs'

type QuestionInput = {
  question: string
  header: string
  options: { label: string; description: string }[]
  multiple?: boolean
}

type PromptOption = {
  title: string
  description: string
  value: string
}

const CUSTOM_VALUE = '__custom__'

const toPromptOptions = (options: QuestionInput['options']): PromptOption[] => [
  ...options.map((option) => ({
    title: option.label,
    description: option.description,
    value: option.label,
  })),
  {
    title: 'Other (type your own)',
    description: 'Provide a custom answer',
    value: CUSTOM_VALUE,
  },
]

const askCustomAnswer = async (): Promise<string | null> => {
  const custom = await prompts({
    type: 'text',
    name: 'value',
    message: 'Your answer:',
  })

  return custom.value || null
}

const askSingleChoice = async (question: string, choices: PromptOption[]) => {
  const response = await prompts({
    type: 'select',
    name: 'selected',
    message: question,
    choices,
  })

  const selected = response.selected as string | undefined

  if (!selected) return []
  if (selected !== CUSTOM_VALUE) return [selected]

  const custom = await askCustomAnswer()
  return custom ? [custom] : []
}

const askMultipleChoices = async (
  question: string,
  choices: PromptOption[]
): Promise<string[]> => {
  const response = await prompts({
    type: 'multiselect',
    name: 'selected',
    message: question,
    choices,
    hint: 'Space to select, Enter to confirm',
  })

  let selected = (response.selected as string[] | undefined) || []
  if (!selected.includes(CUSTOM_VALUE)) return selected

  selected = selected.filter((choice) => choice !== CUSTOM_VALUE)
  const custom = await askCustomAnswer()
  if (custom) selected.push(custom)

  return selected
}

const formatAnswers = (questions: QuestionInput[], answers: string[][]) =>
  questions
    .map((q, i) => {
      const answer = answers[i]?.length ? answers[i].join(', ') : 'Unanswered'
      return `"${q.question}" = "${answer}"`
    })
    .join(', ')

export const execute = async (questions: QuestionInput[]) => {
  logTools(`[tool] question()`)

  const answers: string[][] = []

  for (const question of questions) {
    console.log(`\n  \x1b[36m${question.header}\x1b[0m`)
    const choices = toPromptOptions(question.options)

    if (question.multiple)
      answers.push(await askMultipleChoices(question.question, choices))
    else answers.push(await askSingleChoice(question.question, choices))
  }

  const formatted = formatAnswers(questions, answers)

  return `User has answered your questions: ${formatted}. Continue with the user's answers in mind.`
}

export const definition = {
  question: tool({
    description:
      'Ask the user questions during execution. Use this to gather preferences, clarify ambiguous instructions, get decisions on implementation choices, or offer choices about what direction to take. Answers are returned as arrays of labels. If you recommend a specific option, make it the first option and add "(Recommended)" at the end of the label.',
    inputSchema: z.object({
      questions: z
        .array(
          z.object({
            question: z
              .string()
              .describe('The complete question to ask the user'),
            header: z
              .string()
              .describe('Short label for the question (max 30 chars)'),
            options: z
              .array(
                z.object({
                  label: z
                    .string()
                    .describe('Display text for this option (1-5 words)'),
                  description: z
                    .string()
                    .describe('Explanation of what this option means'),
                })
              )
              .min(2)
              .max(5)
              .describe('Available choices for this question'),
            multiple: z
              .boolean()
              .optional()
              .describe(
                'Allow selecting multiple options. Default: false (single select)'
              ),
          })
        )
        .min(1)
        .max(4)
        .describe('Questions to ask the user (1-4 questions)'),
    }),
    outputSchema: z.string(),
  }),
}
