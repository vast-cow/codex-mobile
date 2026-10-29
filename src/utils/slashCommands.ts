export type SlashSkill = { name: string; displayName?: string; description: string; path: string; enabled?: boolean }
export type SlashSuggestion = { kind: 'command'; name: 'goal' | 'plan'; description: string }
  | { kind: 'skill'; skill: SlashSkill }

export function slashSuggestions(skills: SlashSkill[], query: string, limit = 20): SlashSuggestion[] {
  const normalized = query.trim().replace(/^\/+/, '').toLowerCase()
  const commands: SlashSuggestion[] = [
    { kind: 'command', name: 'goal', description: 'Set or manage the goal for this thread' },
    { kind: 'command', name: 'plan', description: 'Toggle plan mode for this thread' },
  ]
  const result = commands.filter((item) => item.kind === 'command' && item.name.includes(normalized))
  const rows = skills.filter((skill) => skill.enabled !== false && skill.name.trim() && skill.path.trim()).map((skill) => {
    const names = [skill.name, skill.displayName ?? ''].map((name) => name.toLowerCase())
    const score = !normalized ? 0 : names.includes(normalized) ? 0 : names.some((name) => name.startsWith(normalized)) ? 1
      : names.some((name) => name.includes(normalized)) ? 2 : skill.description.toLowerCase().includes(normalized) ? 3
      : skill.path.toLowerCase().includes(normalized) ? 4 : Infinity
    return { skill, score }
  }).filter((row) => Number.isFinite(row.score)).sort((a, b) => a.score - b.score || (a.skill.displayName || a.skill.name).localeCompare(b.skill.displayName || b.skill.name))
  result.push(...rows.map(({ skill }) => ({ kind: 'skill' as const, skill })))
  return result.slice(0, Math.max(0, limit))
}
