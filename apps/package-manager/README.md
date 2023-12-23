# Pruebas de diferentes empaquetadores

## Empaquetadores para producción

### tsc
```
"build:tsc": "rimraf dist && tsc",
```

### esbuild
```
"build:esbuild": "rimraf dist && esbuild app/**/*.js app/**/*.ts --color=true --bundle=true --splitting --minify=false --analyze --platform=node --format=esm --packages=external --outdir=dist",
```

### rollup
```
"build:rollup": "rimraf dist && rollup --config rollup.config.js",
```

## Referencias
https://github.com/rollup/plugins
https://esbuild.github.io/
https://www.typescriptlang.org/tsconfig
https://rollupjs.org/command-line-interface/
