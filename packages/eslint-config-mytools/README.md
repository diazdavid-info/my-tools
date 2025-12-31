# Introducción

[![NPM license](https://img.shields.io/npm/l/eslint-config-mytools.svg)](https://www.npmjs.com/package/eslint-config-mytools)
[![NPM version](https://img.shields.io/npm/v/eslint-config-mytools.svg)](https://www.npmjs.com/package/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-config-mytools&maxAge=3600)](http://www.npmtrends.com/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-config-mytools.svg)](http://www.npmtrends.com/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-config-mytools.svg)](http://www.npmtrends.com/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-config-mytools.svg)](http://www.npmtrends.com/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-config-mytools.svg)](http://www.npmtrends.com/eslint-config-mytools)

`eslint-config-mytools` te ayuda a configurar `eslint` y `prettier` en tu proyecto según las necesidades de tu equipo.

## Instalación

```bash
pnpm add -D eslint eslint-config-mytools
```

Si también necesitas `prettier`, requiere que de lo instales

```bash
pnpm add -D prettier prettier-plugin-astro
```

Si tu proyecto es de `Astro` también necesitarás instalar la librería de `prettier` para `Astro`

```bash
pnpm add -D prettier
```

## Configurar eslint para proyectos de Javascript

Tienes que crear un fichero `eslint.config.mjs` dentro de tu proyecto e importar la config para js

```js
import { defineConfig } from 'eslint/config'
import { base } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
])
```

## Configurar eslint para proyectos de Typescript

Tienes que crear un fichero `eslint.config.mjs` dentro de tu proyecto e importar la config para js

```js
import { defineConfig } from 'eslint/config'
import { base, typescript } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
  ...typescript,
])
```

## Configurar eslint para proyectos de React con Typescript o Javascript

Tienes que crear un fichero `eslint.config.mjs` dentro de tu proyecto e importar la config para js

```js
import { defineConfig } from 'eslint/config'
import { base, typescript, react } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
  ...typescript,
  ...react,
])
```

## Configurar eslint para proyectos de Astro

Tienes que crear un fichero `eslint.config.mjs` dentro de tu proyecto e importar la config para js

```js
import { defineConfig } from 'eslint/config'
import { astro, base, typescript } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
  ...typescript,
  ...astro,
])
```

Si tienes React, añadir también la config

```js
import { defineConfig } from 'eslint/config'
import { astro, base, typescript, react } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
  ...typescript,
  ...astro,
  ...react,
])
```

## Configurar Prettier para para cualquier proyecto

Tienes que crear un fichero `eslint.config.mjs` dentro de tu proyecto e importar la config para js

```js
import { defineConfig } from 'eslint/config'
import { prettier } from 'eslint-config-mytools'

export default defineConfig([
  ...prettier,
])
```

Si quieres que los ficheros `.astro`, `.json` y `.md` te funcionen con prettier, es requisito tener un fichero `prettier.config.mjs`

```js
/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
export default {
  plugins: ['prettier-plugin-astro'],
  singleQuote: true,
  printWidth: 120,
  semi: false,
  trailingComma: 'all',
}
```

Y añadir en tu fichero `package.json` el siguiente script

```
"format": "prettier --write **/*{.astro,.json,.md}"
```

La configuración de prettier que se importa en eslint solo afectará a fichero: `**/*.{js,mjs,cjs,jsx,ts,jsx,tsx}`
