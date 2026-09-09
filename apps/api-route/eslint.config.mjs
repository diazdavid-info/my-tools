import { base, prettier, typescript } from 'eslint-config-mytools'

export default [
  ...base,
  ...typescript,
  ...prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
