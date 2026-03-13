import { createMCPClient } from '@ai-sdk/mcp'
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio'
import { mcpConfig } from '../shared/config'
import { logInfo, logError, logTools } from '../shared/logs'
import type { McpServerConfig } from '../shared/config-template'

type MCPClient = Awaited<ReturnType<typeof createMCPClient>>

const clients: MCPClient[] = []
const toolNameMap = new Map<string, string>()

function createTransport(config: McpServerConfig) {
  if (config.type === 'stdio') {
    return new Experimental_StdioMCPTransport({
      command: config.command,
      args: config.args,
      env: { ...process.env, ...config.env } as Record<string, string>,
      stderr: 'ignore',
    })
  }

  return {
    type: 'sse' as const,
    url: config.url,
    headers: config.headers,
  }
}

export async function initMcpClients() {
  const servers = await mcpConfig()
  const entries = Object.entries(servers)

  if (!entries.length) return

  for (const [name, config] of entries) {
    try {
      const client = await createMCPClient({
        transport: createTransport(config),
        onUncaughtError: (error) => {
          logError(
            `MCP "${name}": ${error instanceof Error ? error.message : error}`
          )
        },
      })

      clients.push(client)

      const tools = await client.tools()

      for (const toolName of Object.keys(tools)) {
        toolNameMap.set(toolName, `mcp_${name}_${toolName}`)
      }

      const count = Object.keys(tools).length
      logInfo(`MCP "${name}": ${count} tool${count === 1 ? '' : 's'} connected`)
    } catch (error) {
      logError(
        `MCP "${name}" failed to connect: ${
          error instanceof Error ? error.message : error
        }`
      )
    }
  }
}

export async function getMcpTools() {
  const tools: Record<string, any> = {}

  for (const client of clients) {
    const clientTools = await client.tools()

    for (const [toolName, toolDef] of Object.entries(clientTools)) {
      const prefixed = toolNameMap.get(toolName)
      if (!prefixed) continue

      const originalExecute = toolDef.execute

      tools[prefixed] = {
        ...toolDef,
        execute: originalExecute
          ? async (args: unknown, opts: any) => {
              logTools(`${prefixed}(${JSON.stringify(args)})`)
              return originalExecute(args, opts)
            }
          : undefined,
      }
    }
  }

  return tools
}

export function isMcpTool(toolName: string) {
  return toolNameMap.has(toolName)
}

export async function closeMcpClients() {
  for (const client of clients) {
    try {
      await client.close()
    } catch {}
  }

  clients.length = 0
  toolNameMap.clear()
}
