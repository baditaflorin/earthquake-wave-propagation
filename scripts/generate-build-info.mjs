import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

function gitValue(args, fallback) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback
  } catch {
    return fallback
  }
}

const commit = gitValue(['rev-parse', '--short', 'HEAD'], 'uncommitted')
const branch = gitValue(['branch', '--show-current'], 'main')
const builtAt = new Date().toISOString()

mkdirSync('src/generated', { recursive: true })

writeFileSync(
  'src/generated/buildInfo.ts',
  `export const buildInfo = ${JSON.stringify(
    {
      name: packageJson.name,
      version: packageJson.version,
      commit,
      branch,
      builtAt,
      repositoryUrl: 'https://github.com/baditaflorin/earthquake-wave-propagation',
      paypalUrl: 'https://www.paypal.com/paypalme/florinbadita',
      pagesUrl: 'https://baditaflorin.github.io/earthquake-wave-propagation/',
    },
    null,
    2,
  )} as const\n`,
)
