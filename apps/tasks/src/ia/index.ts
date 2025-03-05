import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { simpleGit } from 'simple-git'

const generateDiff = async () => {
  return simpleGit().diff()
}

const callAI = async (diff: string) => {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system:
      'Eres un experto en programacion de javascript y sobre todo en testing. Response siempre en español. La respuesta siempre va a ser impresa en consola, formatea el texto para que se entienda en una consola.',
    messages: [
      {
        role: 'user',
        content:
          'Te paso el diff de git del código que he modificado. Centrate en el nombre de los test y dime si gramaticamente están bien dicho o se puede modificar.'
      },
      {
        role: 'user',
        content:
          'Dame siempre el nombre de todos los test que encuentres y siempre con las keys actual, nuevo y una explicación de porque esta mal.'
      },
      {
        role: 'user',
        content: `'''\n${diff}\n'''`
      }
    ],
    temperature: 0.8,
    maxTokens: 4096
  })

  return text
}

const run = async () => {
  const diff = await generateDiff()
  const text = await callAI(diff)
  console.log(text)
}

export default run
