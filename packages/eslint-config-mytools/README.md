# Introduction

[![NPM license](https://img.shields.io/npm/l/eslint-config-mytools.svg)](https://www.npmjs.com/package/eslint-config-mytools)
[![NPM version](https://img.shields.io/npm/v/eslint-config-mytools.svg)](https://www.npmjs.com/package/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-config-mytools&maxAge=3600)](http://www.npmtrends.com/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-config-mytools.svg)](http://www.npmtrends.com/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-config-mytools.svg)](http://www.npmtrends.com/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-config-mytools.svg)](http://www.npmtrends.com/eslint-config-mytools)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-config-mytools.svg)](http://www.npmtrends.com/eslint-config-mytools)

`eslint-config-mytools` helps you configure `eslint` and `prettier` in your project according to your team's needs.

## Installation

```bash
pnpm add -D eslint eslint-config-mytools
```

If you also need `prettier`, you need to install it:

```bash
pnpm add -D prettier prettier-plugin-astro
```

If your project is using `Astro`, you will also need to install the `prettier` library for `Astro`:

```bash
pnpm add -D prettier
```

## Configure eslint for Javascript projects

You have to create an `eslint.config.mjs` file in your project and import the js config:

```js
import { defineConfig } from 'eslint/config'
import { base } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
])
```

## Configure eslint for Typescript projects

You have to create an `eslint.config.mjs` file in your project and import the js config:

```js
import { defineConfig } from 'eslint/config'
import { base, typescript } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
  ...typescript,
])
```

## Configure eslint for React projects with Typescript or Javascript

You have to create an `eslint.config.mjs` file in your project and import the js config:

```js
import { defineConfig } from 'eslint/config'
import { base, typescript, react } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
  ...typescript,
  ...react,
])
```

## Configure eslint for Astro projects

You have to create an `eslint.config.mjs` file in your project and import the js config:

```js
import { defineConfig } from 'eslint/config'
import { astro, base, typescript } from 'eslint-config-mytools'

export default defineConfig([
  ...base,
  ...typescript,
  ...astro,
])
```

If you have React, add the config as well:

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

## Configure Prettier for any project

You have to create an `eslint.config.mjs` file in your project and import the js config:

```js
import { defineConfig } from 'eslint/config'
import { prettier } from 'eslint-config-mytools'

export default defineConfig([
  ...prettier,
])
```

If you want `.astro`, `.json`, and `.md` files to work with prettier, a `prettier.config.mjs` file is required:

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

And add the following script to your `package.json` file:

```json
{
  "format": "prettier --write **/*{.astro,.json,.md}"
}
```

The prettier configuration imported into eslint will only affect files: `**/*.{js,mjs,cjs,jsx,ts,jsx,tsx}`
