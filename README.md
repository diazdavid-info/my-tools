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

## Versionar y publicar paquetes

1. Ejecuta `pnpm changeset` y elige los proyectos y el tipo de cambio (`major`, `minor` o `patch`).
2. Incluye el changeset en el PR del cambio. Al integrarlo en `main`, CI crea o actualiza un PR con las versiones, changelogs y lockfile.
3. Integra el PR de versiones. Tras pasar CI, se publican con procedencia las versiones pendientes de los paquetes autorizados que ya existen en npm. Changesets también gestiona versiones y changelogs para los proyectos privados. [Lista de paquetes autorizados](.github/scripts/filter-npm-publish-plan.mjs).

### Activar la publicación automática

- En GitHub, habilita **Allow GitHub Actions to create and approve pull requests** bajo **Settings → Actions → General**.
- En npm, configura un Trusted Publisher para cada paquete antes de su primera publicación automática. Selecciona GitHub Actions, el propietario `diazdavid-info`, el repositorio `my-tools` y el workflow `github-actions.yml`. Deja el entorno vacío y habilita `npm publish`. [Documentación de npm](https://docs.npmjs.com/trusted-publishers/).

CI ejecuta `npm audit signatures` para verificar las firmas del registro y las atestaciones de procedencia disponibles antes de ejecutar los scripts de instalación de las dependencias.
