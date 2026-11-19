import { appendFile, readFile, writeFile } from 'node:fs/promises'

const managedPackages = new Set([
  'api-route',
  'clean-pc',
  'eslint-config-mytools',
  'mytools-components',
  'mytools-tasks',
  'mytools-tsconfig',
  'typing-testing',
])

async function canPublish(release) {
  if (release.kind !== 'publish' || !managedPackages.has(release.name)) return false

  const url = new URL(encodeURIComponent(release.name), 'https://registry.npmjs.org/')
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })

  if (response.status === 404) {
    console.log(`Skipping ${release.name} because it has no npm release.`)
    return false
  }
  if (!response.ok) throw new Error(`Could not check ${release.name} on npm (HTTP ${response.status})`)

  const { maintainers, versions } = await response.json()
  if (!maintainers?.some(({ name }) => name === 'diazdavid-info') || !versions || Object.keys(versions).length === 0) {
    console.log(`Skipping ${release.name} because it has no npm release maintained by diazdavid-info.`)
    return false
  }

  return !Object.hasOwn(versions, release.version)
}

const [planPath] = process.argv.slice(2)
const publishPlan = JSON.parse(await readFile(planPath, 'utf8'))
if (publishPlan.version !== 1 || !Array.isArray(publishPlan.plan)) throw new Error('Unsupported Changesets publish plan')

const filteredPlan = []
for (const group of publishPlan.plan) {
  const eligible = await Promise.all(group.map(canPublish))
  const releases = group.filter((_, index) => eligible[index])
  if (releases.length > 0) filteredPlan.push(releases)
}

await writeFile(planPath, JSON.stringify({ ...publishPlan, plan: filteredPlan }, null, 2) + '\n')
console.log('npm releases:', filteredPlan.flat().map(({ name, version }) => `${name}@${version}`).join(', ') || 'none')
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `has-packages=${filteredPlan.length > 0}\n`)
}
