import { afterEach, describe, expect, it, vi } from 'vitest'
import { findReasoningModel, reasoningCatalog } from './modelCapabilities'
import { getAvailableModelCatalog, startThreadTurn } from './codexGateway'

afterEach(() => {
  reasoningCatalog.value = { providerId: '', models: [] }
  vi.unstubAllGlobals()
})

describe('provider-scoped reasoning', () => {
  it('does not reuse capabilities across providers sharing a model ID', () => {
    reasoningCatalog.value = { providerId: 'codex', models: [{ id: 'shared', supportedReasoningEfforts: ['high'] }] }
    expect(findReasoningModel('shared', 'openai')?.id).toBe('shared')
    expect(findReasoningModel('shared', 'custom_endpoint')).toBeNull()
    expect(findReasoningModel('shared')).toBeNull()
  })

  it('validates direct turns and collaboration settings without extra requests', async () => {
    const requests: Array<{ params: Record<string, any> }> = []
    reasoningCatalog.value = { providerId: 'codex', models: [{ id: 'model', supportedReasoningEfforts: ['low', 'high'], defaultReasoningEffort: 'low' }] }
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
      requests.push(JSON.parse(init.body))
      return new Response(JSON.stringify({ result: { turn: { id: 'turn' } } }))
    }))
    await startThreadTurn('thread', 'hello', [], 'model', 'xhigh', undefined, [], 'plan', 'codex')
    await startThreadTurn('thread', 'hello', [], 'model', 'high', undefined, [], 'default', 'custom_endpoint')
    expect(requests).toHaveLength(2)
    expect(requests[0].params.effort).toBe('low')
    expect(requests[0].params.collaborationMode.settings.reasoning_effort).toBe('low')
    expect(requests[1].params).not.toHaveProperty('effort')
    expect(requests[1].params.collaborationMode.settings.reasoning_effort).toBeNull()
  })

  it('avoids model/list for a thread locked to a different provider', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ data: ['shared'], exclusive: true })))
    vi.stubGlobal('fetch', fetch)
    expect(await getAvailableModelCatalog({ providerId: 'custom_endpoint', configuredProviderId: 'openai', requireProviderModels: true }))
      .toEqual({ ids: ['shared'], models: [] })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not load the configured Zen catalog into a Codex thread', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect(await getAvailableModelCatalog({ providerId: 'codex', configuredProviderId: 'opencode-zen' }))
      .toEqual({ ids: [], models: [] })
    expect(fetch).not.toHaveBeenCalled()
  })
})
