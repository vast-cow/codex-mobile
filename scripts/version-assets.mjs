import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../dist/', import.meta.url))
async function files(directory) {
  const rows = await readdir(directory, { withFileTypes: true })
  const result = []
  for (const row of rows.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    const path = join(directory, row.name)
    if (row.isDirectory()) result.push(...await files(path))
    else if (row.isFile() && path !== join(root, 'sw.js')) result.push(path)
  }
  return result
}
const hash = createHash('sha256')
for (const path of await files(root)) {
  const content = await readFile(path)
  hash.update(relative(root, path).replaceAll('\\', '/')).update('\0')
  hash.update(String(content.length)).update('\0').update(content)
}
const version = hash.digest('hex').slice(0, 20)
const workerPath = join(root, 'sw.js')
const worker = await readFile(workerPath, 'utf8')
if (!/^const CACHE_NAME = '[^']+'/m.test(worker)) throw new Error('Missing service worker cache version')
await writeFile(workerPath, worker.replace(/^const CACHE_NAME = '[^']+'/m, `const CACHE_NAME = 'codexweb-${version}'`))
console.log(`Frontend cache version: ${version}`)
