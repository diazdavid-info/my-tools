# Config eslint

## Install

```bash
pnpm add -D eslint-config-mytools
```

Add file in root project
```js
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['mytools'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
}
```
