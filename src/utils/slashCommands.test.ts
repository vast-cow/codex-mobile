import { describe, expect, it } from 'vitest'
import { slashSuggestions } from './slashCommands'

describe('slash suggestions', () => {
  const skills = [
    { name: 'build', description: 'Build a project', path: '/skills/build' },
    { name: 'review', displayName: 'Review changes', description: 'Review a build', path: '/skills/review' },
    { name: 'disabled', description: '', path: '/skills/disabled', enabled: false },
  ]
  it('prioritizes built-in commands and caps results', () => {
    expect(slashSuggestions(skills, '', 2)).toMatchObject([{ name: 'goal' }, { name: 'plan' }])
    expect(slashSuggestions(skills, '/pl')).toMatchObject([{ name: 'plan' }])
  })
  it('ranks skill names before descriptions and excludes disabled skills', () => {
    expect(slashSuggestions(skills, 'build')).toMatchObject([{ skill: { name: 'build' } }, { skill: { name: 'review' } }])
    expect(slashSuggestions(skills, 'disabled')).toEqual([])
  })
})
