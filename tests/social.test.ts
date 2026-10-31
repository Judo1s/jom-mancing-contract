import { describe, it, expect } from 'vitest'
import { FriendsFeedItem, NotificationItem, NotificationType, SavedCatchesResponse } from '../src/social'

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

describe('FriendsFeedItem.savedByMe', () => {
  const item = {
    id: 'c1', userId: 'u1', userName: 'Ali', userImage: null,
    title: null, speciesName: 'Haruan', photoUrl: null, photoUrls: [],
    weightGrams: null, lengthMm: null, baitUsed: null, setupUsed: null, note: null,
    spotName: null, spotId: null, caughtAt: new Date().toISOString(),
    strikeCount: 0, struckByMe: false, savedByMe: true, commentCount: 0, isFollowing: false,
  }

  it('accepts a feed item carrying savedByMe, and a saved-posts list of them', () => {
    expect(FriendsFeedItem.parse(item).savedByMe).toBe(true)
    expect(() => SavedCatchesResponse.parse({ catches: [item] })).not.toThrow()
  })

  it('requires savedByMe', () => {
    const { savedByMe, ...rest } = item
    expect(() => FriendsFeedItem.parse(rest)).toThrow()
  })
})
