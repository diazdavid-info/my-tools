import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { aiConfig } from '../shared/config'
import { logMarkdown } from '../shared/logs'
import { fileReview } from '../shared/system-prompts'
import {
  createDir,
  homeDir,
  pathExists,
  writeFile,
} from '../shared/file-system'
import prompts from 'prompts'
import ora from 'ora'

const askUserByFiles = async () => {
  const cwd = process.cwd()

  const files = await fg('**/*.{ts,js,tsx,jsx,json}', {
    cwd,
    onlyFiles: true,
    dot: false,
    ignore: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'tmp/**',
    ],
    absolute: true,
  })

  const choices = files.map((absPath) => ({
    title: path.relative(cwd, absPath),
    value: absPath,
  }))

  const { selectedFiles } = await prompts(
    {
      type: 'autocompleteMultiselect',
      name: 'selectedFiles',
      message: 'Select files to review',
      choices,
      limit: 10,
    },
    {
      onCancel: () => {
        throw new Error('User cancelled')
      },
    }
  )

  return selectedFiles
}

const askUserByQuestion = async () => {
  const { question } = await prompts(
    {
      type: 'text',
      name: 'question',
      initial: 'Qué te parece este código?',
      message: 'What would you like to ask?',
    },
    {
      onCancel: () => {
        throw new Error('User cancelled')
      },
    }
  )

  return question
}

const saveFile = async (content: string) => {
  if (!pathExists(`${homeDir()}/.mytools/ia`))
    await createDir(`${homeDir()}/.mytools/ia`)

  const now = new Date()

  const pad = (n: number) => String(n).padStart(2, '0')

  const formatted =
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())

  await writeFile(
    `${homeDir()}/.mytools/ia/${formatted}-code-assistance.md`,
    content
  )
}

const getContentFiles = async (files: string[]) => {
  const normalizeWhitespace = (code: string) =>
    code.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+$/gm, '')

  const optimizeCode = (code: string) => normalizeWhitespace(code)

  const contents = await Promise.all(
    files.map((file) => readFile(file, 'utf8'))
  )

  return contents
    .map((content, i) => {
      const filename = path.basename(files[i])
      const optimized = optimizeCode(content)

      return `FICHERO: ${filename}\n${optimized}\n--- END FILE ---`
    })
    .join('\n\n')
}

const callAI = async (question: string, content: string) => {
  const spinner = ora('Analyzing code...').start()

  const { url, token, bigModel } = await aiConfig()
  const openai = createOpenAI({
    baseURL: url,
    apiKey: token,
  })

  const { text } = await generateText({
    model: openai(bigModel),
    system: fileReview,
    messages: [
      {
        role: 'user',
        content: `${question}\n\n${content}`,
      },
    ],
    temperature: 0.1,
  })

  spinner.succeed('Analysis completed')

  return text
}

const run = async () => {
  const files = await askUserByFiles()
  const question = await askUserByQuestion()
  const content = await getContentFiles(files)
  if (!content) return
  const reviewComment = await callAI(question, content)
  await saveFile(reviewComment)
  await logMarkdown(reviewComment)
}

export default run
