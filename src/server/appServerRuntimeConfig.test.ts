import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildAppServerArgs } from './appServerRuntimeConfig'

afterEach(() => vi.unstubAllEnvs())

describe('app-server runtime config', () => {
  it('inherits the Codex sandbox unless explicitly configured', () => {
    vi.stubEnv('CODEXUI_SANDBOX_MODE', '')
    expect(buildAppServerArgs().some((arg) => arg.startsWith('sandbox_mode='))).toBe(false)
  })

  it('accepts explicit sandbox configuration and ignores invalid values', () => {
    vi.stubEnv('CODEXUI_SANDBOX_MODE', 'workspace-write')
    expect(buildAppServerArgs()).toContain('sandbox_mode="workspace-write"')
    vi.stubEnv('CODEXUI_SANDBOX_MODE', 'invalid')
    expect(buildAppServerArgs().some((arg) => arg.startsWith('sandbox_mode='))).toBe(false)
  })
  it('enables Codex memories by default for spawned app-server processes', () => {
    const args = buildAppServerArgs()
    const featureIndex = args.indexOf('features.memories=true')

    expect(featureIndex).toBeGreaterThan(0)
    expect(args[featureIndex - 1]).toBe('-c')
  })

  it('can disable Codex memories through runtime configuration', () => {
    process.env.CODEXUI_MEMORIES = 'false'
    try {
      const args = buildAppServerArgs()
      const featureIndex = args.indexOf('features.memories=false')

      expect(featureIndex).toBeGreaterThan(0)
      expect(args[featureIndex - 1]).toBe('-c')
      expect(args).not.toContain('features.memories=true')
    } finally {
      delete process.env.CODEXUI_MEMORIES
    }
  })
})
