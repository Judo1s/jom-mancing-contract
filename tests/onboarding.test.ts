import { describe, it, expect } from 'vitest'
import { MALAYSIAN_STATES, MalaysianState, ExperienceLevel } from '../src/common'
import { CompleteOnboardingRequest } from '../src/onboarding'
import { AuthUser } from '../src/auth'
import { UpdateProfileRequest } from '../src/profile'

const valid = {
  state: 'Selangor',
  experienceLevel: 'BEGINNER',
  targetSpeciesIds: ['spc_1', 'spc_2'],
}

describe('MALAYSIAN_STATES', () => {
  it('lists all 13 states and 3 federal territories', () => {
    expect(MALAYSIAN_STATES).toHaveLength(16)
  })

  it('has no duplicates', () => {
    expect(new Set(MALAYSIAN_STATES).size).toBe(MALAYSIAN_STATES.length)
  })

  it('accepts a listed state and rejects an unlisted one', () => {
    expect(MalaysianState.parse('Pahang')).toBe('Pahang')
    expect(() => MalaysianState.parse('Bangkok')).toThrow()
  })
})

describe('ExperienceLevel', () => {
  it('has exactly the three levels the onboarding cards offer', () => {
    expect(ExperienceLevel.options).toEqual(['BEGINNER', 'CASUAL', 'OTAI'])
  })
})

describe('CompleteOnboardingRequest', () => {
  it('accepts a fully answered onboarding', () => {
    expect(CompleteOnboardingRequest.parse(valid).state).toBe('Selangor')
  })

  it('accepts zero species, because a failed catalog fetch must not brick a blocking step', () => {
    expect(CompleteOnboardingRequest.parse({ ...valid, targetSpeciesIds: [] }).targetSpeciesIds).toEqual([])
  })

  it('rejects more than five species, which would make the system prompt unbounded', () => {
    expect(() => CompleteOnboardingRequest.parse({ ...valid, targetSpeciesIds: ['a', 'b', 'c', 'd', 'e', 'f'] })).toThrow()
  })

  it('rejects a duplicate species id', () => {
    expect(() => CompleteOnboardingRequest.parse({ ...valid, targetSpeciesIds: ['a', 'a'] })).toThrow()
  })

  it('requires state and experienceLevel — both are blocking steps', () => {
    expect(() => CompleteOnboardingRequest.parse({ targetSpeciesIds: [] })).toThrow()
  })

  it('treats bio and image as optional and nullable', () => {
    const parsed = CompleteOnboardingRequest.parse({ ...valid, bio: null, image: null })
    expect(parsed.bio).toBeNull()
  })
})

describe('AuthUser', () => {
  it('carries onboardingCompletedAt, which is the whole gate condition', () => {
    const parsed = AuthUser.parse({
      id: 'u1',
      email: 'a@b.com',
      name: 'Ali',
      username: 'ali',
      role: 'ANGLER',
      image: null,
      bio: null,
      state: null,
      onboardingCompletedAt: null,
    })
    expect(parsed.onboardingCompletedAt).toBeNull()
  })
})

describe('UpdateProfileRequest', () => {
  it('accepts the two onboarding answers, so backfilled accounts can still set them', () => {
    const parsed = UpdateProfileRequest.parse({ experienceLevel: 'OTAI', targetSpeciesIds: ['spc_1'] })
    expect(parsed.experienceLevel).toBe('OTAI')
  })
})
