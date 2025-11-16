import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { simpleGit } from 'simple-git'
import { aiConfig } from '../shared/config'
import { log, logInfo, logMarkdown } from '../shared/logs'
import prompts from 'prompts'

async function gitFetch() {
  logInfo('making a git fetch...')
  await simpleGit().fetch()
  log('git fetch completed')
}

const getRemoteBranches = async (): Promise<string[]> => {
  return (await simpleGit().branch(['-r'])).all
}

const askUserByBaseBranch = async (branchList: string[]) => {
  const { baseBranch } = await prompts({
    type: 'select',
    name: 'baseBranch',
    message: 'What base branch?',
    choices: branchList.map((branch) => ({ title: branch, value: branch })),
  })

  return baseBranch
}

const generateDiff = async (baseBranch: string): Promise<string | null> => {
  return simpleGit().diff([
    `${baseBranch}...HEAD`,
    '--unified=0',
    '--ignore-all-space',
    '--ignore-blank-lines',
    '--',
    ':!*.lock',
    ':!dist',
    ':!coverage',
  ])
}

const callAI = async (diff: string | null) => {
  const { url, token, bigModel } = await aiConfig()
  const openai = createOpenAI({
    baseURL: url,
    apiKey: token,
  })

  const { text } = await generateText({
    model: openai(bigModel),
    system: `Eres un revisor de código senior especializado en JavaScript, TypeScript y Node.js.
    Vas a analizar un diff completo de Git y devolver un *code review* claro, breve y útil.
    
    Reglas:
    - Revisa posibles errores de TypeScript, malos tipos o código dudoso.
    - Detecta problemas reales: lógica peligrosa, malas prácticas, anti-patrones, duplicación innecesaria, uso incorrecto de promesas o async/await, etc.
    - Sugiere refactor solo cuando sea **obvio y claramente beneficioso**.
    - No inventes requisitos ni hagas suposiciones no realistas.
    - No incluyas el diff completo ni reescribas código entero.
    - Devuelve la respuesta organizada en secciones:
        1. Riesgos o errores potenciales
        2. Problemas menores o mejoras rápidas
        3. Refactor obvio (si aplica)
        4. Comentarios generales
    - La salida siempre tiene que ser un formato markdown bien estructurado
    `,
    messages: [
      {
        role: 'user',
        content: `Analiza este diff y dame un code review útil y conciso:\n\n${diff}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 1500,
  })

  await logMarkdown(text)
}

const run = async () => {
  await gitFetch()
  const remoteBranches = await getRemoteBranches()
  const baseBranch = await askUserByBaseBranch(remoteBranches)
  const diff = await generateDiff(baseBranch)
  await callAI(diff)
}

export default run
