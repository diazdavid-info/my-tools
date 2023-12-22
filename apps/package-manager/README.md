# Pruebas de diferentes empaquetadores

## esbuild + tsx
En estas pruebas usamos tsx para el entorno de dev y esbuild para la build de pro
```
"build": "rimraf dist && esbuild app/server.js --color=true --bundle --minify --analyze --platform=node --format=esm --packages=external --outdir=dist",
"dev": "tsx watch app/server.js",
```
