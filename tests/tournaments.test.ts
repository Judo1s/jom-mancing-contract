import { describe, it, expect } from 'vitest'
import { CreateTournamentRequest, SetTournamentPromotionRequest, EventListQuery } from '../src/tournaments'
import { EventItem } from '../src/events'

describe('CreateTournamentRequest', () => {
  const valid = {
    title: 'Piala Patin 2026',
    startsAt: '2026-10-01T00:00:00.000Z',
    endsAt: '2026-10-01T08:00:00.000Z',
  }

  it('accepts a minimal valid tournament', () => {
    expect(CreateTournamentRequest.parse(valid)).toMatchObject({ title: 'Piala Patin 2026' })
  })

  // The security boundary: these are stripped, not merely ignored downstream.
  it('strips status and promotion fields an owner tries to set', () => {
    const parsed = CreateTournamentRequest.parse({
      ...valid,
      status: 'APPROVED',
      isPromoted: true,
      promotedUntil: '2099-01-01T00:00:00.000Z',
      reviewNote: 'looks good to me',
    }) as Record<string, unknown>
    expect(parsed.status).toBeUndefined()
    expect(parsed.isPromoted).toBeUndefined()
    expect(parsed.promotedUntil).toBeUndefined()
    expect(parsed.reviewNote).toBeUndefined()
  })

  it('rejects an end date at or before the start date', () => {
    expect(CreateTournamentRequest.safeParse({ ...valid, endsAt: valid.startsAt }).success).toBe(false)
  })

  it('rejects a negative entry fee', () => {
    expect(CreateTournamentRequest.safeParse({ ...valid, entryFeeSen: -1 }).success).toBe(false)
  })
})

describe('SetTournamentPromotionRequest', () => {
  it('requires an explicit end date alongside the flag', () => {
    expect(SetTournamentPromotionRequest.safeParse({ isPromoted: true }).success).toBe(false)
  })

  it('accepts clearing a promotion', () => {
    expect(SetTournamentPromotionRequest.parse({ isPromoted: false, promotedUntil: null })).toEqual({
      isPromoted: false,
      promotedUntil: null,
    })
  })
})

describe('EventListQuery', () => {
  it('defaults to upcoming events sorted soonest-first', () => {
    expect(EventListQuery.parse({})).toMatchObject({ when: 'upcoming', sort: 'soonest', limit: 20 })
  })

  it('coerces numeric query-string values', () => {
    expect(EventListQuery.parse({ limit: '5', lat: '3.139', lng: '101.6869' })).toMatchObject({
      limit: 5,
      lat: 3.139,
    })
  })

  it('caps limit at 50', () => {
    expect(EventListQuery.safeParse({ limit: '500' }).success).toBe(false)
  })
})

describe('EventItem', () => {
  it('carries the coordinates the detail screen needs for directions', () => {
    const item = EventItem.parse({
      id: 'c1', spotId: 's1', spotName: 'Kolam Patin', title: 'Piala', description: null,
      startsAt: '2026-10-01T00:00:00.000Z', endsAt: '2026-10-01T08:00:00.000Z',
      entryFeeSen: null, prizePoolSen: null, contactPhone: null, imageUrl: null,
      isPromoted: false, latitude: 3.139, longitude: 101.6869, state: 'Selangor', distanceKm: null,
    })
    expect(item.latitude).toBe(3.139)
  })
})
