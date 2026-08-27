import { describe, it, expect } from 'vitest'
import { HomeKolamItem, HomeRailResponse } from '../src/home'

const base = {
  kolamId: 'k1',
  spotId: 's1',
  name: 'Kolam Pak Mat',
  latitude: 3.07,
  longitude: 101.52,
  isFeatured: false,
  avgRating: 4.5,
  category: 'Freshwater Fish',
  thumbnailUrl: null,
  hasHours: true,
  openNow: true,
  opensAt: null,
  closesAt: '18:00',
  distanceKm: 4.2,
}

describe('HomeKolamItem', () => {
  it('accepts a fully populated item', () => {
    expect(() => HomeKolamItem.parse(base)).not.toThrow()
  })

  it('accepts a null distance, for the no-location fallback', () => {
    expect(() => HomeKolamItem.parse({ ...base, distanceKm: null })).not.toThrow()
  })

  it('accepts a kolam with no hours data at all', () => {
    expect(() =>
      HomeKolamItem.parse({ ...base, hasHours: false, openNow: false, opensAt: null, closesAt: null }),
    ).not.toThrow()
  })

  it('rejects a missing hasHours flag', () => {
    const { hasHours, ...withoutFlag } = base
    expect(() => HomeKolamItem.parse(withoutFlag)).toThrow()
  })
})

describe('HomeRailResponse', () => {
  it('accepts empty lists with usedLocation false', () => {
    expect(() => HomeRailResponse.parse({ nearest: [], featured: [], usedLocation: false })).not.toThrow()
  })

  it('rejects a missing usedLocation flag', () => {
    expect(() => HomeRailResponse.parse({ nearest: [], featured: [] })).toThrow()
  })
})
