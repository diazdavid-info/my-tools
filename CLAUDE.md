# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Private monorepo managed with **pnpm workspaces** and **Turborepo**. Contains shared packages (`packages/*`) and applications (`apps/*`). Some packages are published publicly to npm.

## Commands

```bash
# Root-level (Turbo-orchestrated across all packages)
pnpm build          # Build all packages and apps
pnpm dev            # Dev/watch mode for all packages
pnpm test           # Run all tests
pnpm format         # Prettier format all .ts/.tsx/.js files

# Run commands for a specific package
pnpm --filter <package-name> build
pnpm --filter <package-name> dev
pnpm --filter <package-name> test
pnpm --filter <package-name> lint

# Versioning (changesets)
pnpm changeset              # Create a new changeset
pnpm changeset version      # Bump versions from changesets
pnpm changeset publish      # Publish to npm
```

## Architecture

### Shared Packages (`packages/`)

| Package | Purpose | Build Tool |
|---------|---------|------------|
| **eslint-config-mytools** | Shared ESLint flat config (exports: base, typescript, react, astro, prettier) | — |
| **mytools-tsconfig** | Shared TypeScript configs (base.json, node.json, react-library.json) | — |
| **mytools-components** | React component library (`'use client'` banner for RSC) | tsup (ESM+CJS+dts) |
| **typing-test** | Type testing utilities | @vercel/ncc |

### Applications (`apps/`)

| App | Purpose | Build Tool | Test Framework |
|-----|---------|------------|----------------|
| **mytools-tasks** | CLI (`tasks`) — branch/PR creation, AI-powered commit/review/assistance via Vercel AI SDK + OpenAI | tsup (CJS, node18) | Jest (ts-jest) |
| **api-route** | Lightweight Node.js HTTP router library | tsc | — |
| **clean-pc** | CLI (`clean-pc`) — find large dirs/files on disk | @vercel/ncc | — |
| **typing** | Astro web app — typing practice | Astro | — |
| **task-generator** | Astro + React web app — Jira task management with Atlassian OAuth | Astro | — |
| **monaco-editor** | Astro web app — browser code editor | Astro | — |

### Dependency Graph

- **mytools-tsconfig** is extended by all packages/apps via `tsconfig.json`
- **eslint-config-mytools** is used by all packages/apps for linting (ESLint 9 flat config)
- **typing-test** is a workspace dependency of the **typing** app

### Testing

- **Jest** in `apps/tasks`: `pnpm --filter mytools-tasks test` (single test: `pnpm --filter mytools-tasks test -- --testPathPattern=<pattern>`)
- **Vitest** in `packages/typing-test`: `pnpm --filter typing-test test` (uses happy-dom environment)

## Conventions

- **TypeScript strict mode** everywhere (via mytools-tsconfig/base.json)
- CLI tools produce a single minified bundle in `dist/` with a `bin` entry in package.json
- Libraries export dual ESM+CJS with `.d.ts` declarations
- Astro apps use Tailwind CSS for styling
- Workspace dependencies use `workspace:*` or `workspace:^` protocol
- Public packages set `"publishConfig": { "access": "public" }`
- CI runs on GitHub Actions: checkout → pnpm install → build → test (Node 20)