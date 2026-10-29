import { describe, expect, it, vi } from 'vitest'
import { BackendQueueProcessor } from './codexAppServerBridge'

describe('queued reasoning capabilities', () => {
  for (const [provider, expected] of [['openai', 'low'], ['custom_endpoint', null]] as const) {
    it(`validates queued collaboration effort for ${provider}`, async () => {
      const rpc = vi.fn(async (method: string) => {
        if (method === 'thread/resume') return { modelProvider: provider }
        if (method === 'config/read') return { config: { model: 'model', model_provider: 'openai', model_reasoning_effort: 'xhigh' } }
        if (method === 'model/list') return { data: [{ id: 'model', supportedReasoningEfforts: ['low'], defaultReasoningEffort: 'low' }] }
        return {}
      })
      const processor = new BackendQueueProcessor({ rpc, onNotification: () => () => undefined } as never)
      const start = processor as unknown as { startQueuedTurn: (turn: unknown) => Promise<void> }
      await start.startQueuedTurn({ threadId: 'thread', message: { text: 'queued', imageUrls: [], fileAttachments: [], skills: [], collaborationMode: 'default' } })
      const params = (rpc.mock.calls.find(([method]) => method === 'turn/start') as unknown as [string, { collaborationMode: { settings: { reasoning_effort: unknown } } }])[1]
      expect(params.collaborationMode.settings.reasoning_effort).toBe(expected)
      expect(rpc.mock.calls.filter(([method]) => method === 'model/list')).toHaveLength(provider === 'openai' ? 1 : 0)
      processor.dispose()
    })
  }
})
