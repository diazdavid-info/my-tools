[![my-tools CI](https://github.com/diazdavid-info/my-tools/actions/workflows/github-actions.yml/badge.svg)](https://github.com/diazdavid-info/my-tools/actions/workflows/github-actions.yml)

# Mis herramientas del día a día

En este proyecto están las herramientas que uso y aprovecho para probar:

1. pnpm
2. los monorepos con los workspace de npm
3. torborepo de Vercel

## Instalación

Usa la versión de Node.js de [`.node-version`](.node-version) y la versión de pnpm de `packageManager` en `package.json`. Luego clona el proyecto.

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

## Desplegar apps y publicar nuevas versiones

- Ejecuta `pnpm build` y `pnpm test` antes de abrir el PR. Ejecuta `pnpm changeset` para elegir los proyectos que van a subir de versión y el tipo de cambio (`patch`, `minor` o `major`). Incluye el changeset en el mismo PR.
- Fusiona el PR del cambio en `main`. GitHub Actions verifica las dependencias, compila el repo y ejecuta las pruebas.
- Comprueba el despliegue de la app en su plataforma. `task-generator` usa Vercel y `typing` genera un sitio estático en `apps/typing/dist/`.
- En Cloudflare Pages, configura `monaco-editor` con `main` como rama de producción, la raíz del repo como directorio de trabajo, `PNPM_VERSION=11.21.0`, el comando `pnpm --filter monaco-editor build` y la salida `apps/monaco-editor/dist`. Pages lee la versión de Node de `.node-version`. [Entorno de compilación de Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/build-image/).
- Para `split-count` y `search-home`, construye la imagen desde la raíz con el Dockerfile de la app, por ejemplo `docker build -f apps/split-count/Dockerfile .`. En el despliegue, monta un volumen persistente y apunta `DB_PATH` a un fichero SQLite dentro del volumen.
- Si hay changesets pendientes en `main`, GitHub Actions crea o actualiza el PR de versiones desde `changeset-release/main`. Revisa las versiones y los changelogs. Si GitHub lo pide, pulsa **Approve workflows to run** para ejecutar los checks del PR.
- Fusiona el PR de versiones cuando pasen los checks. Tras validar `main`, GitHub Actions publica con procedencia las versiones pendientes de los paquetes autorizados que ya existen en npm. Changesets también registra versiones y changelogs de las apps privadas. [Lista de paquetes autorizados](.github/scripts/filter-npm-publish-plan.mjs).
- Confirma en GitHub Actions que pasó el job `publish` y verifica en npm la nueva versión, su etiqueta `latest` y su procedencia.

### Activar la publicación automática

- En GitHub, habilita **Allow GitHub Actions to create and approve pull requests** bajo **Settings → Actions → General**.
- En npm, configura un Trusted Publisher para cada paquete antes de su primera publicación automática. Selecciona GitHub Actions, el propietario `diazdavid-info`, el repositorio `my-tools` y el workflow `github-actions.yml`. Deja el entorno vacío y habilita `npm publish`. La primera publicación debe completarse dentro de los dos días siguientes a la configuración. [Documentación de npm](https://docs.npmjs.com/trusted-publishers/#trusted-publisher-configuration-expiry).

CI ejecuta `npm audit signatures` para verificar las firmas del registro y las atestaciones de procedencia disponibles antes de ejecutar los scripts de instalación de las dependencias.
