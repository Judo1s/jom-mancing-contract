import { describe, it, expect } from 'vitest'
import { NotificationItem, NotificationType } from '../src/social'

describe('NotificationType', () => {
  it('accepts the two new rank-crossing types', () => {
    expect(() => NotificationType.parse('RANK_ENTERED_PODIUM')).not.toThrow()
    expect(() => NotificationType.parse('RANK_LEFT_PODIUM')).not.toThrow()
  })
})

describe('NotificationItem', () => {
  const withoutActor = {
    type: 'RANK_ENTERED_PODIUM' as const,
    actorId: null, actorName: null, actorImage: null,
    catchId: 'c1', catchPhotoUrl: null, catchSpeciesName: null,
    kolamId: 'k1', kolamName: 'Kolam X', rank: 2, rejectionReason: null,
    createdAt: new Date().toISOString(), unread: true,
  }

  it('accepts a rank-crossing notification with a null actor', () => {
    expect(() => NotificationItem.parse(withoutActor)).not.toThrow()
  })

  it('still accepts an existing notification type with a real actor and null rank fields', () => {
    expect(() =>
      NotificationItem.parse({
        type: 'STRIKE', actorId: 'u1', actorName: 'Bob', actorImage: null,
        catchId: 'c1', catchPhotoUrl: null, catchSpeciesName: null,
        kolamId: null, kolamName: null, rank: null, rejectionReason: null,
        createdAt: new Date().toISOString(), unread: false,
      }),
    ).not.toThrow()
  })

  it('rejects a notification missing the new kolamId/kolamName/rank fields', () => {
    const { kolamId, kolamName, rank, ...rest } = withoutActor
    expect(() => NotificationItem.parse(rest)).toThrow()
  })
})
