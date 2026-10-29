import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearThreadGoal, getThreadGoal, normalizeThreadGoal, setThreadGoal } from './threadGoals'

afterEach(() => vi.unstubAllGlobals())
describe('thread goals', () => {
  it('rejects malformed goals and keeps supported budget states', () => {
    expect(normalizeThreadGoal({ threadId: 't', objective: 'work', status: 'unknown' })).toBeNull()
    expect(normalizeThreadGoal({ threadId: 't', objective: 'work', status: 'budgetLimited', tokenBudget: 100 }))
      .toMatchObject({ status: 'budgetLimited', tokenBudget: 100, tokensUsed: 0 })
  })
  it('reads, updates and clears a goal using thread-scoped RPCs', async () => {
    const requests: unknown[] = []
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body)
      requests.push(body)
      return new Response(JSON.stringify({ result: body.method.endsWith('/clear') ? { cleared: true } : {
        goal: { threadId: 't', objective: body.params.objective ?? 'initial', status: body.params.status ?? 'active' },
      } }))
    }))
    expect((await getThreadGoal('t'))?.objective).toBe('initial')
    expect(await setThreadGoal('t', 'updated', 'paused')).toMatchObject({ objective: 'updated', status: 'paused' })
    expect(await clearThreadGoal('t')).toBe(true)
    expect(requests).toEqual([
      { method: 'thread/goal/get', params: { threadId: 't' } },
      { method: 'thread/goal/set', params: { threadId: 't', objective: 'updated', status: 'paused' } },
      { method: 'thread/goal/clear', params: { threadId: 't' } },
    ])
  })
})
