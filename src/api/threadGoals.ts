import { rpcCall } from './codexRpcClient'

export const GOAL_STATUSES = ['active', 'paused', 'blocked', 'usageLimited', 'budgetLimited', 'complete'] as const
export type GoalStatus = typeof GOAL_STATUSES[number]
export type ThreadGoal = {
  threadId: string
  objective: string
  status: GoalStatus
  tokenBudget: number | null
  tokensUsed: number
  timeUsedSeconds: number
}

export function normalizeThreadGoal(value: unknown): ThreadGoal | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (typeof row.threadId !== 'string' || !row.threadId.trim() || typeof row.objective !== 'string'
    || !GOAL_STATUSES.includes(row.status as GoalStatus)) return null
  const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null
  return {
    threadId: row.threadId, objective: row.objective, status: row.status as GoalStatus,
    tokenBudget: number(row.tokenBudget), tokensUsed: number(row.tokensUsed) ?? 0,
    timeUsedSeconds: number(row.timeUsedSeconds) ?? 0,
  }
}

export async function getThreadGoal(threadId: string): Promise<ThreadGoal | null> {
  const result = await rpcCall<{ goal?: unknown }>('thread/goal/get', { threadId })
  if (result.goal == null) return null
  const goal = normalizeThreadGoal(result.goal)
  if (!goal) throw new Error('thread/goal/get response was malformed')
  return goal
}

export async function setThreadGoal(threadId: string, objective: string, status: GoalStatus): Promise<ThreadGoal> {
  const result = await rpcCall<{ goal?: unknown }>('thread/goal/set', { threadId, objective, status })
  const goal = normalizeThreadGoal(result.goal)
  if (!goal) throw new Error('thread/goal/set response was malformed')
  return goal
}

export async function clearThreadGoal(threadId: string): Promise<boolean> {
  const result = await rpcCall<{ cleared?: boolean }>('thread/goal/clear', { threadId })
  return result.cleared === true
}
