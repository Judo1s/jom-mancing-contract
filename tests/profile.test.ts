import { describe, it, expect } from 'vitest'
import { KolamRankingItem, ProfileResponse } from '../src/profile'

describe('KolamRankingItem', () => {
  it('accepts a well-formed ranking row', () => {
    expect(() =>
      KolamRankingItem.parse({
        kolamId: 'kolam1', kolamName: 'Kolam Pancing Desa Aman', rank: 4, weightGrams: 3200, catchId: 'catch1',
      }),
    ).not.toThrow()
  })

  it('rejects a missing rank', () => {
    expect(() =>
      KolamRankingItem.parse({ kolamId: 'kolam1', kolamName: 'X', weightGrams: 3200, catchId: 'catch1' }),
    ).toThrow()
  })
})

describe('ProfileResponse.kolamRankings', () => {
  const base = {
    id: 'u1', name: 'Ali', role: 'ANGLER' as const, username: 'ali', usernameChangeableAt: null,
    email: 'ali@example.com', image: null, bio: null, state: null, isPremium: false,
    stats: { totalCatches: 0, speciesCount: 0, biggestCatchGrams: null },
    followerCount: 0, followingCount: 0, savedSpotsPreview: [], savedSpotCount: 0, savedSpotLimit: 3,
    experienceLevel: null, targetSpeciesIds: [],
    instagramUrl: null, facebookUrl: null, tiktokUrl: null, youtubeUrl: null,
  }

  it('accepts an empty rankings list', () => {
    expect(() => ProfileResponse.parse({ ...base, kolamRankings: [] })).not.toThrow()
  })

  it('accepts a populated rankings list', () => {
    expect(() =>
      ProfileResponse.parse({
        ...base,
        kolamRankings: [{ kolamId: 'k1', kolamName: 'Kolam X', rank: 2, weightGrams: 5000, catchId: 'c1' }],
      }),
    ).not.toThrow()
  })

  it('rejects a response missing kolamRankings entirely', () => {
    expect(() => ProfileResponse.parse(base)).toThrow()
  })
})
