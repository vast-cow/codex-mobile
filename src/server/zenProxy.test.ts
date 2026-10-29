import { describe, expect, it } from 'vitest'
import { normalizeZenResponsesRequest } from './zenProxy'

describe('Zen Responses normalization', () => {
  it('preserves actual tools and input while adding missing required tool names once', () => {
    const bash = { type: 'function', name: 'bash', parameters: { type: 'object', properties: { command: { type: 'string' } } } }
    const input = [{ role: 'user', content: 'hello' }]
    const request = { model: 'test-free', input, tools: [bash], store: true, stream: false }
    const normalized = normalizeZenResponsesRequest(request)
    expect(normalized).toMatchObject({ input, model: 'test-free', store: false, stream: true, tool_choice: 'auto' })
    expect(normalized.tools).toEqual([bash, expect.objectContaining({ name: 'read', type: 'function' })])
    expect(request.tools).toEqual([bash])
    expect(normalizeZenResponsesRequest(normalized).tools).toEqual(normalized.tools)
  })
})
