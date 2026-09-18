/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DB_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
