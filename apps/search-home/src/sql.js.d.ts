declare module 'sql.js' {
  interface Database {
    run(sql: string, params?: unknown[]): Database
    exec(sql: string): QueryExecResult[]
    prepare(sql: string): Statement
    getRowsModified(): number
    export(): Uint8Array
    close(): void
  }

  interface Statement {
    bind(params?: unknown[]): boolean
    step(): boolean
    getAsObject(): Record<string, unknown>
    run(params?: unknown[]): void
    free(): void
  }

  interface QueryExecResult {
    columns: string[]
    values: unknown[][]
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database
  }

  export type { Database, Statement, QueryExecResult, SqlJsStatic }
  export default function initSqlJs(): Promise<SqlJsStatic>
}
