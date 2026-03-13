import { generateText, ModelMessage } from 'ai'
import { agent, criticalMaximumSteps } from '../shared/system-prompts'
import { logIA, logInfo } from '../shared/logs'
import prompts from 'prompts'
import { executeTool, toolDefinitions } from './tools'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { createOpenAI } from '@ai-sdk/openai'
import { aiConfig } from '../shared/config'
import { LanguageModelV3 } from '@openrouter/ai-sdk-provider'
import fs from 'node:fs'
import { initMcpClients, getMcpTools, isMcpTool, closeMcpClients } from './mcp'

const TARGET_DIR = path.resolve(process.argv[2] || process.cwd())
const MAX_TOOL_ITERATIONS = 100
const messages: ModelMessage[] = []
const sessionTokens = { input: 0, output: 0 }
const INSTRUCTION_FILES = ['AGENTS.md', 'CLAUDE.md', 'CONTEXT.md'] as const

function logTokenUsage(inputTokens = 0, outputTokens = 0) {
  const totalTokens = inputTokens + outputTokens
  sessionTokens.input += inputTokens
  sessionTokens.output += outputTokens
  const sessionTotal = sessionTokens.input + sessionTokens.output
  logInfo(
    `Context: ${inputTokens.toLocaleString()} input + ${outputTokens.toLocaleString()} output = ${totalTokens.toLocaleString()} tokens (session: ${sessionTotal.toLocaleString()})`
  )
}

const askUserByQuestion = async (): Promise<string> => {
  const { question } = await prompts(
    {
      type: 'text',
      name: 'question',
      message: '🫀',
    },
    {
      onCancel: () => {
        throw new Error('User cancelled')
      },
    }
  )

  return question
}

function isGitRepo() {
  try {
    const result = execSync('git rev-parse --is-inside-work-tree', {
      cwd: TARGET_DIR,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    return result.trim() === 'true'
  } catch {
    return false
  }
}

function environmentPrompt(modelName: string) {
  return [
    `You are powered by the model named ${modelName}. The exact model ID is ${modelName}`,
    'Here is some useful information about the environment you are running in:',
    '<env>',
    `  Working directory: ${TARGET_DIR}`,
    `  Is directory a git repo: ${isGitRepo() ? 'yes' : 'no'}`,
    `  Platform: ${process.platform}`,
    `  Today's date: ${new Date().toDateString()}`,
    '</env>',
  ].join('\n')
}

function instructionPrompt() {
  for (const file of INSTRUCTION_FILES) {
    const filePath = path.join(TARGET_DIR, file)

    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return `Instructions from: ${filePath}\n${content}`
    } catch {}
  }

  return ''
}

function initialPrompt(modelName: string) {
  return [agent, environmentPrompt(modelName), instructionPrompt()]
    .filter(Boolean)
    .join('\n\n')
}

const toolLoop = async (
  messages: ModelMessage[],
  openAIModel: LanguageModelV3,
  allTools: Record<string, any>
) => {
  for (let step = 1; step <= MAX_TOOL_ITERATIONS; step++) {
    const isLastStep = step === MAX_TOOL_ITERATIONS

    const result = await generateText({
      model: openAIModel,
      messages: isLastStep
        ? [
            ...messages,
            { role: 'assistant' as const, content: criticalMaximumSteps },
          ]
        : messages,
      tools: isLastStep ? undefined : allTools,
      toolChoice: isLastStep ? undefined : 'auto',
    })

    const responseMessages = result.response.messages
    messages.push(...responseMessages)

    if (result.text) logIA(result.text)

    if (
      isLastStep ||
      result.finishReason === 'stop' ||
      result.toolCalls.length === 0
    ) {
      logTokenUsage(result.usage.inputTokens, result.usage.outputTokens)
      return
    }

    for (const toolCall of result.toolCalls) {
      const { toolName: name, input: args } = toolCall

      if (isMcpTool(name)) continue

      const resultValue = await executeTool(name, args)

      messages.push({
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: toolCall.toolCallId,
            toolName: name,
            output: { type: 'text', value: resultValue },
          },
        ],
      })
    }
  }
}

const loop = async () => {
  const { url, token, bigModel } = await aiConfig()

  const openai = createOpenAI({
    baseURL: url,
    apiKey: token,
  })

  const openAIModel = openai.chat(bigModel)

  await initMcpClients()
  const mcpTools = await getMcpTools()
  const allTools = { ...toolDefinitions, ...mcpTools }

  const cleanup = async () => {
    await closeMcpClients()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  messages.push({ role: 'system', content: initialPrompt(bigModel) })

  while (true) {
    const question = await askUserByQuestion()

    messages.push({ role: 'user', content: question })

    await toolLoop(messages, openAIModel, allTools)
  }
}

const run = async () => {
  await loop()
}

export default run
