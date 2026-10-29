import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('local package snapshot launcher', () => {
  it('reuses identical contents, invalidates changed contents and forwards CLI flags', () => {
    const root = mkdtempSync(join(tmpdir(), 'codexapp-launcher-test-'))
    try {
      for (const dir of ['scripts', 'dist', 'dist-cli']) mkdirSync(join(root, dir))
      copyFileSync(new URL('../../scripts/run-local.cjs', import.meta.url), join(root, 'scripts/run-local.cjs'))
      writeFileSync(join(root, 'dist/index.html'), 'frontend')
      writeFileSync(join(root, 'dist-cli/index.js'), 'cli')
      const fakeNpm = join(root, 'npm-cli.js')
      writeFileSync(fakeNpm, `
const fs = require('node:fs'), path = require('node:path')
const args = process.argv.slice(2)
if (args[0] === 'config') console.log(path.join(__dirname, 'cache'))
else if (args[0] === 'pack') {
  const dir = args[args.indexOf('--pack-destination') + 1]
  fs.writeFileSync(path.join(dir, 'snapshot.tgz'), process.env.TEST_PACKAGE_CONTENT)
  console.log(JSON.stringify([{ filename: 'snapshot.tgz' }]))
} else if (args[0] === 'exec') fs.writeFileSync(path.join(__dirname, 'args.json'), JSON.stringify(args))
else process.exit(2)
`)
      const run = (content: string) => {
        execFileSync(process.execPath, [join(root, 'scripts/run-local.cjs'), '--no-password', '--port', '4190'], {
          env: { ...process.env, npm_execpath: fakeNpm, TEST_PACKAGE_CONTENT: content },
        })
        return JSON.parse(readFileSync(join(root, 'args.json'), 'utf8')) as string[]
      }
      const first = run('revision one')
      expect(run('revision one')).toEqual(first)
      expect(run('revision two')).not.toEqual(first)
      expect(first).toContain(`--package=${join(root, 'cache/_codexapp-local', createHash('sha256').update('revision one').digest('hex') + '.tgz')}`)
      expect(first.slice(-4)).toEqual(['codexapp', '--no-password', '--port', '4190'])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
