[![my-tools CI](https://github.com/diazdavid-info/my-tools/actions/workflows/github-actions.yml/badge.svg)](https://github.com/diazdavid-info/my-tools/actions/workflows/github-actions.yml)

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
  1. eslint-config-mytools -> mi configuración de eslint y pritter que será compartida para todas las herramientas del
     monorepo
  2. mytools-tsconfig -> mi configuraciones de typescript que será compartida para todas las herramientas del monorepo
  3. mytools-components -> un listado de componentes que estarán disponibles para posibles proyectos de front alojados
     en este monorepo

## Cómo inicializar nueva app o nuevo package

1. Crea un directorio dentro de `/apps` o de `/packages`
2. Inicializa pnpm `pnpm init`
3. Instala ts y eslint `pnpm i -D @mytools/tsconfig eslint-config-mytools`
4. Copia los ficheros `.eslintrc.js` y `tsconfig.json` de cualquiera otra app

## Como subir de versión un paquete y publicarlo

1. Ejecutar `changeset add`
2. Añadir el paquete que se quiere subir de versión y si es `major`, `minor` o `patch`
3. Hacer un commit. Ejemplo de mensaje `Add changeset`
4. Ejecutar `changeset version` que subirá de versión los paquete que hemos selecionado antes
5. Hacer un commit. Ejemplo de mensaje `update version`
6. Ejecutar `changeset publish` que subirar los paquete que tienen que subir
