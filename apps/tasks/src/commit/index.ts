import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { simpleGit } from 'simple-git'

const generateDiff = async (): Promise<string | null> => {
  return simpleGit().diff()
}

const callAI = async (diff: string | null) => {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `Eres un experto en control de versiones y buenas prácticas de desarrollo. 
    Tu tarea es analizar un diff de Git y proponer un mensaje de commit **natural, breve y descriptivo**, sin prefijos como "feat:" o "fix:".
    El mensaje debe:
      - Resumir qué se hizo (añadido, modificado, eliminado, refactorizado, etc.)
      - Ser entendible por cualquier desarrollador
      - Estar en un solo renglón y en tono imperativo (por ejemplo: "Update user validation", "Remove unused imports").
    No incluyas código, explicaciones ni formato adicional, solo el mensaje final.`,
    messages: [
      {
        role: 'user',
        content: `Analiza este diff y genera un mensaje de commit breve y claro:\n\n${diff}`
      }
    ],
    temperature: 0.8,
    maxTokens: 500
  })

  return text
}

const run = async () => {
  const diff = await generateDiff()
  const text = await callAI(diff)
  console.log(text)
}

export default run
