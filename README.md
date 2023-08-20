# Mis herramientas del día a día

En este proyecto están las herramientas que uso y aprovecho para probar: 
1. pnpm
2. los monorepos con los workspace de npm
3. torborepo de Vercel

## Instalación

Clonar el proyecto
```
git clone git@github.com:diazdavid-info/my-tools.git
```

Instalar las dependencias
```
pnpm i
```

## Qué hay dentro del este proyecto

1. packages
   1. eslint-config-mytools -> mi configuración de eslint y pritter que será compartida para todas las herramientas del monorepo
   2. mytools-tsconfig -> mi configuraciones de typescript que será compartida para todas las herramientas del monorepo
   3. mytools-components -> un listado de componentes que estarán disponibles para posibles proyectos de front alojados en este monorepo

## Cómo inicializar nueva app o nuevo package

1. Crea un directorio dentro de `/apps` o de `/packages`
2. Inicializa pnpm `pnpm init`
3. Instala ts y eslint `pnpm i -D @mytools/tsconfig eslint-config-mytools`
4. Copia los ficheros `.eslintrc.js` y `tsconfig.json` de cualquiera otra app
