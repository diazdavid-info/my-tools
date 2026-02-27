import {
  execute as executeGlob,
  definition as definitionGlob,
} from './tools/glob'
import {
  execute as executeRead,
  definition as definitionRead,
} from './tools/read'
import {
  execute as executeGrep,
  definition as definitionGrep,
} from './tools/grep'
import {
  execute as executeEdit,
  definition as definitionEdit,
} from './tools/edit'
import {
  execute as executeWrite,
  definition as definitionWrite,
} from './tools/write'
import {
  execute as executeBash,
  definition as definitionBash,
} from './tools/bash'
import {
  execute as executeQuestion,
  definition as definitionQuestion,
} from './tools/question'

const executors: Record<string, (args: any) => Promise<string>> = {
  glob: (args) => executeGlob(args.pattern),
  read: (args) => executeRead(args.file_path, args.offset, args.limit),
  grep: (args) => executeGrep(args.pattern, args.file_glob),
  edit: (args) => executeEdit(args.file_path, args.old_string, args.new_string),
  write: (args) => executeWrite(args.file_path, args.content),
  bash: (args) => executeBash(args.command, args.timeout),
  question: (args) => executeQuestion(args.questions),
}

export const executeTool = async (toolName: string, toolArgs: any) => {
  const executor = executors[toolName]
  if (!executor) return `Tool ${toolName} not found`
  return executor(toolArgs)
}

export const toolDefinitions = {
  ...definitionGlob,
  ...definitionRead,
  ...definitionGrep,
  ...definitionEdit,
  ...definitionWrite,
  ...definitionBash,
  ...definitionQuestion,
}
