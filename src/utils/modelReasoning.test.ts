import { describe, expect, it, vi } from 'vitest'
import { normalizeProviderId, readModelCapabilities, reasoningOptions, resolveReasoningEffort } from './modelReasoning'

describe('model reasoning capabilities', () => {
  const model = { supportedReasoningEfforts: ['high', { reasoningEffort: 'low', description: 'Quick' }, 'high', '', null], defaultReasoningEffort: 'low' }
  it('preserves server ordering, descriptions and future values without duplicates', () => {
    expect(reasoningOptions(model)).toEqual([
      { value: 'high', label: 'High', description: '' },
      { value: 'low', label: 'Low', description: 'Quick' },
    ])
    expect(resolveReasoningEffort({ supportedReasoningEfforts: ['adaptive'] }, 'adaptive')).toBe('adaptive')
  })
  it('validates selections, then uses a supported default or the first option', () => {
    expect(resolveReasoningEffort(model, 'high')).toBe('high')
    expect(resolveReasoningEffort(model, 'xhigh')).toBe('low')
    expect(resolveReasoningEffort({ ...model, defaultReasoningEffort: 'medium' }, '')).toBe('high')
    expect(resolveReasoningEffort({ id: 'gpt-5', defaultReasoningEffort: 'high' }, 'high')).toBe('')
  })
  it('normalizes provider aliases', () => {
    expect(normalizeProviderId('openai')).toBe('codex')
    expect(normalizeProviderId('opencode_zen')).toBe('opencode-zen')
  })
  it('paginates once per cursor and deduplicates models', async () => {
    const rpc = vi.fn().mockResolvedValueOnce({ data: [{ id: 'a' }], nextCursor: 'next' })
      .mockResolvedValueOnce({ data: [{ id: 'a' }, { id: 'b' }], nextCursor: 'next' })
    expect(await readModelCapabilities(rpc)).toEqual([{ id: 'a' }, { id: 'b' }])
    expect(rpc.mock.calls).toEqual([[{}], [{ cursor: 'next' }]])
  })
  it('bounds a broken provider issuing an endless stream of cursors', async () => {
    let cursor = 0
    const rpc = vi.fn(async () => ({ data: [], nextCursor: String(++cursor) }))
    await readModelCapabilities(rpc)
    expect(rpc).toHaveBeenCalledTimes(100)
  })
})
