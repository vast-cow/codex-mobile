import { shallowRef } from 'vue'
import { normalizeProviderId, type ModelCapabilities } from '../utils/modelReasoning'

export const reasoningCatalog = shallowRef<{ providerId: string; models: ModelCapabilities[] }>({ providerId: '', models: [] })

export function findReasoningModel(modelId: string, providerId?: string): ModelCapabilities | null {
  const catalog = reasoningCatalog.value
  if (typeof providerId !== 'string' || catalog.providerId !== normalizeProviderId(providerId)) return null
  return catalog.models.find((model) => model.id === modelId || model.model === modelId) ?? null
}
