import { describe, it, expect } from 'vitest'
import {
  CreateCatchRequest,
  CatchLogItem,
  MAX_CATCH_SPECIES,
  MAX_SPECIES_NAME_LENGTH,
  normalizeCatchSpecies,
} from '../src/catch-log'
import { FriendsFeedItem } from '../src/social'

describe('CreateCatchRequest.setupUsed', () => {
  const base = { caughtAt: new Date().toISOString() }

  it('is optional, so older app builds that never send it still validate', () => {
    expect(CreateCatchRequest.parse(base).setupUsed).toBeUndefined()
    expect(CreateCatchRequest.parse({ ...base, setupUsed: null }).setupUsed).toBeNull()
  })

  it('trims and caps the free text', () => {
    expect(CreateCatchRequest.parse({ ...base, setupUsed: '  7 ft rod, 20 lb braid ' }).setupUsed).toBe('7 ft rod, 20 lb braid')
    expect(() => CreateCatchRequest.parse({ ...base, setupUsed: 'x'.repeat(201) })).toThrow()
  })
})

describe('CreateCatchRequest.otherSpeciesNames', () => {
  const base = { caughtAt: new Date().toISOString() }

  it('is optional and stays undefined when absent, so older app builds still validate', () => {
    expect(CreateCatchRequest.parse(base).otherSpeciesNames).toBeUndefined()
    expect(CreateCatchRequest.parse({ ...base, speciesName: 'Patin', otherSpeciesNames: [] }).otherSpeciesNames).toEqual([])
  })

  it('accepts up to MAX_CATCH_SPECIES - 1 extras and rejects more', () => {
    const nine = Array.from({ length: MAX_CATCH_SPECIES - 1 }, (_, i) => `Fish ${i}`)
    expect(CreateCatchRequest.parse({ ...base, speciesName: 'Patin', otherSpeciesNames: nine }).otherSpeciesNames).toHaveLength(9)
    expect(() => CreateCatchRequest.parse({ ...base, speciesName: 'Patin', otherSpeciesNames: [...nine, 'One more'] })).toThrow()
  })

  it('rejects an over-long extra name', () => {
    expect(() =>
      CreateCatchRequest.parse({ ...base, speciesName: 'Patin', otherSpeciesNames: ['x'.repeat(MAX_SPECIES_NAME_LENGTH + 1)] }),
    ).toThrow()
  })
})

describe('normalizeCatchSpecies', () => {
  it('trims, drops blanks, de-duplicates case-insensitively and drops the main fish', () => {
    expect(
      normalizeCatchSpecies({
        speciesName: ' Patin ',
        otherSpeciesNames: ['tilapia', 'Tilapia ', '', '  ', 'PATIN', 'patin', 'Rohu'],
      }),
    ).toEqual({ speciesName: 'Patin', otherSpeciesNames: ['tilapia', 'Rohu'] })
  })

  it('caps the total at MAX_CATCH_SPECIES (main + extras)', () => {
    const many = Array.from({ length: 20 }, (_, i) => `Fish ${i}`)
    const out = normalizeCatchSpecies({ speciesName: 'Patin', otherSpeciesNames: many })
    expect(out.otherSpeciesNames).toHaveLength(MAX_CATCH_SPECIES - 1)
  })

  it('treats a missing field as empty', () => {
    expect(normalizeCatchSpecies({ speciesName: 'Patin' })).toEqual({ speciesName: 'Patin', otherSpeciesNames: [] })
    expect(normalizeCatchSpecies({})).toEqual({ speciesName: null, otherSpeciesNames: [] })
  })
})

describe('responses carry otherSpeciesNames', () => {
  it('CatchLogItem and FriendsFeedItem default it to empty when an older server omits it', () => {
    const catchItem = {
      id: 'c', title: null, speciesName: 'Patin', spotName: null, spotId: null, spotKind: null,
      photoUrl: null, photoUrls: [], weightGrams: null, lengthMm: null, baitUsed: null, setupUsed: null,
      note: null, caughtAt: new Date().toISOString(), status: 'PENDING', rejectionReason: null,
      published: true, submittedForVerification: true, strikeCount: 0, struckByMe: false,
    }
    expect(CatchLogItem.parse(catchItem).otherSpeciesNames).toEqual([])
    expect(CatchLogItem.parse({ ...catchItem, otherSpeciesNames: ['Rohu'] }).otherSpeciesNames).toEqual(['Rohu'])
    expect(FriendsFeedItem.shape.otherSpeciesNames).toBeDefined()
  })
})
