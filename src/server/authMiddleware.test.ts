import { mkdtempSync, rmSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import express from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuthSession, type AuthSession } from './authMiddleware.js'

const addresses = [
  '127.0.0.1', '::1', '::ffff:127.0.0.1',
  '100.64.0.1', '100.127.255.254', '::ffff:100.64.0.1',
  'fd7a:115c:a1e0::1', 'fd7a:115c:a1e0:abcd::2',
  '192.168.1.10', '203.0.113.10',
]

function upgradeRequest(remoteAddress: string, cookie?: string): IncomingMessage {
  return {
    socket: { remoteAddress },
    headers: { host: 'localhost:5900', cookie },
  } as IncomingMessage
}

describe('password authentication without IP exemptions', () => {
  let home: string
  let server: Server
  let baseUrl: string
  let session: AuthSession

  beforeEach(async () => {
    home = mkdtempSync(join(tmpdir(), 'codexui-auth-test-'))
    vi.stubEnv('CODEX_HOME', home)
    session = createAuthSession('test-password')
    const app = express()
    app.use((req, _res, next) => {
      Object.defineProperty(req.socket, 'remoteAddress', {
        value: req.headers['x-test-remote'], configurable: true,
      })
      next()
    })
    app.use(session.middleware)
    app.get('/', (_req, res) => { res.send('protected content') })
    server = createServer(app)
    await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Missing server address')
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => { if (error) reject(error); else resolve() })
      server.closeAllConnections()
    })
    vi.unstubAllEnvs()
    rmSync(home, { recursive: true, force: true })
  })

  it.each(addresses)('requires a session for HTTP and WebSocket requests from %s', async (remote) => {
    const response = await fetch(baseUrl, {
      headers: { host: 'localhost:5900', 'x-test-remote': remote },
    })
    expect(await response.text()).toContain('<form id="f">')
    expect(session.isRequestAuthorized(upgradeRequest(remote))).toBe(false)
    expect(session.isRequestAuthorized(upgradeRequest(remote, 'portal_session=invalid'))).toBe(false)
  })

  it('rejects a wrong password and grants HTTP and WebSocket access after sign-in', async () => {
    const login = (password: string) => fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-remote': '127.0.0.1' },
      body: JSON.stringify({ password }),
    })
    const rejected = await login('wrong')
    expect(rejected.status).toBe(401)
    expect(rejected.headers.get('set-cookie')).toBeNull()
    const accepted = await login('test-password')
    expect(accepted.status).toBe(200)
    const cookie = accepted.headers.get('set-cookie')!.split(';')[0]!
    expect(cookie).toMatch(/^portal_session=.+/)
    for (const remote of addresses) {
      const response = await fetch(baseUrl, { headers: { cookie, 'x-test-remote': remote } })
      expect(await response.text()).toBe('protected content')
      expect(session.isRequestAuthorized(upgradeRequest(remote, cookie))).toBe(true)
    }
    // Existing persisted sessions still authorize requests after a server restart.
    expect(createAuthSession('test-password').isRequestAuthorized(upgradeRequest('::1', cookie))).toBe(true)
  })
})
