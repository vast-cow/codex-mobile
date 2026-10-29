export type ModelCapabilities = {
  id?: string
  model?: string
  supportedReasoningEfforts?: unknown
  defaultReasoningEffort?: unknown
}

export type ReasoningOption = { value: string; label: string; description: string }

export function normalizeProviderId(value: string): string {
  const id = value.trim().toLowerCase().replace(/_/g, '-')
  return !id || id === 'openai' ? 'codex' : id
}

export function reasoningOptions(model: ModelCapabilities | null | undefined): ReasoningOption[] {
  if (!Array.isArray(model?.supportedReasoningEfforts)) return []
  const seen = new Set<string>()
  const options: ReasoningOption[] = []
  for (const entry of model.supportedReasoningEfforts) {
    const raw = typeof entry === 'string' ? entry : entry?.reasoningEffort
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (!value || seen.has(value)) continue
    seen.add(value)
    options.push({
      value,
      label: value === 'xhigh' ? 'Extra high' : value[0].toUpperCase() + value.slice(1),
      description: typeof entry?.description === 'string' ? entry.description : '',
    })
  }
  return options
}

export function resolveReasoningEffort(model: ModelCapabilities | null | undefined, requested: unknown): string {
  const options = reasoningOptions(model)
  const supports = (value: unknown): value is string => options.some((option) => option.value === value)
  if (supports(requested)) return requested
  return supports(model?.defaultReasoningEffort) ? model.defaultReasoningEffort : options[0]?.value ?? ''
}

// Bound pagination even if a faulty provider keeps issuing new cursors.
export async function readModelCapabilities(rpc: (params: Record<string, unknown>) => Promise<unknown>): Promise<ModelCapabilities[]> {
  const models = new Map<string, ModelCapabilities>()
  const seenCursors = new Set<string>()
  let cursor = ''
  for (let page = 0; page < 100; page += 1) {
    const payload = await rpc(cursor ? { cursor } : {}) as { data?: ModelCapabilities[]; nextCursor?: string }
    for (const model of Array.isArray(payload?.data) ? payload.data : []) {
      const id = typeof model?.id === 'string' && model.id.trim() || typeof model?.model === 'string' && model.model.trim()
      if (id && !models.has(id)) models.set(id, model)
    }
    cursor = typeof payload?.nextCursor === 'string' ? payload.nextCursor.trim() : ''
    if (!cursor || seenCursors.has(cursor)) break
    seenCursors.add(cursor)
  }
  return [...models.values()]
}
