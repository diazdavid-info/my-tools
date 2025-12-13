import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { simpleGit } from 'simple-git'
import { aiConfig } from '../shared/config'

const generateDiff = async (): Promise<(string | null)[]> => {
  const diff = await simpleGit().diff()
  return diff
    .split('\n')
    .filter((line) => line.startsWith('+') && line.includes('it('))
    .map((line) => {
      const match = line.match(/it\(\s*'([^']+)'\s*,/)
      return match ? match[1] : null
    })
    .filter(Boolean)
}

const callAI = async (diff: (string | null)[]) => {
  const { url, token, model } = await aiConfig()
  const openai = createOpenAI({
    baseURL: url,
    apiKey: token,
  })

  const { text } = await generateText({
    model: openai(model),
    system: `Eres un experto en gramática y redacción en inglés. Tu tarea es revisar los nombres de tests unitarios de un 
    proyecto y corregirlos si tienen errores gramaticales o de estilo. Siempre debes responder con una lista numerada en 
    el siguiente formato:
        1. **Nombre original:** \`<nombre_original>\`
        **Nombre corregido:** \`<nombre_corregido>\`
        **Razón del cambio:** \`<explicación en español de por qué el cambio es necesario>\`
    Si el nombre del test es correcto, responde con el mismo nombre en "Nombre corregido" y una explicación indicando que 
    no requiere cambios. Mantén la estructura de los nombres de test y evita modificar la semántica de la prueba.`,
    messages: [
      {
        role: 'user',
        content: `Aquí tienes una lista de nombres de tests unitarios extraídos de un proyecto. Revisa su gramática y 
        corrige cualquier error si es necesario, siguiendo el formato indicado:
        ${diff.join('\n')}
        Por favor, proporciona la lista con las correcciones y explicaciones en español.`,
      },
    ],
    temperature: 0.8,
    maxOutputTokens: 4096,
  })

  return text
}

const run = async () => {
  const diff = await generateDiff()
  const text = await callAI(diff)
  console.log(text)
}

export default run
