#!/usr/bin/env node

// Directory specs can reuse an old installed npx snapshot even with
// --prefer-online. Give each packed revision its own immutable package spec.
const { createHash } = require('node:crypto')
const { spawnSync } = require('node:child_process')
const { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { basename, dirname, join, resolve } = require('node:path')

const projectRoot = resolve(__dirname, '..')

function findNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    join(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
  ]
  try {
    candidates.push(join(dirname(require.resolve('npm/package.json')), 'bin/npm-cli.js'))
  } catch {}
  const cli = candidates.find(path => path && basename(path) === 'npm-cli.js' && existsSync(path))
  if (!cli) throw new Error('Cannot locate npm. Run this launcher with npm start -- <codexapp options>.')
  return cli
}

function npm(npmCli, args, capture = false) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: projectRoot,
    env: process.env,
    stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8',
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1
    return null
  }
  return capture ? result.stdout : ''
}

function main() {
  if (!existsSync(join(projectRoot, 'dist', 'index.html')) || !existsSync(join(projectRoot, 'dist-cli', 'index.js'))) {
    throw new Error('Build this source checkout first with pnpm install && pnpm run build, then run npm start -- <options>.')
  }
  const npmCli = findNpmCli()
  // Keep tarballs in npm's cache, alongside the installed npx snapshots, so
  // repeated starts share dependencies without retaining an obsolete package.
  const cacheOutput = npm(npmCli, ['config', 'get', 'cache'], true)
  if (cacheOutput === null) return
  const packageCache = join(cacheOutput.trim(), '_codexapp-local')
  mkdirSync(packageCache, { recursive: true })
  const staging = mkdtempSync(join(packageCache, 'pack-'))
  let tarball
  let revision
  try {
    const output = npm(npmCli, [
      'pack', '--json', '--ignore-scripts', '--pack-destination', staging, projectRoot,
    ], true)
    if (output === null) return
    const [packed] = JSON.parse(output)
    if (!packed?.filename || basename(packed.filename) !== packed.filename) {
      throw new Error('npm pack did not return a valid package filename')
    }
    const stagedTarball = join(staging, packed.filename)
    revision = createHash('sha256').update(readFileSync(stagedTarball)).digest('hex')
    tarball = join(packageCache, `${revision}.tgz`)
    if (!existsSync(tarball)) renameSync(stagedTarball, tarball)
  } finally {
    rmSync(staging, { recursive: true, force: true })
  }
  console.log(`[codexapp] Local checkout: ${projectRoot}`)
  console.log(`[codexapp] Package revision: ${revision.slice(0, 16)}`)
  npm(npmCli, [
    'exec', '--yes', '--install-links', `--package=${tarball}`, '--',
    'codexapp', ...process.argv.slice(2),
  ])
}

try {
  main()
} catch (error) {
  console.error(`[codexapp] ${error.message}`)
  process.exitCode = 1
}
