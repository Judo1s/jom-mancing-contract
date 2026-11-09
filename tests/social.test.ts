import { describe, it, expect } from 'vitest'
import { CommentItem, FriendsFeedItem, NotificationItem, NotificationType, PostCommentRequest, SavedCatchesResponse } from '../src/social'

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

describe('comment replies', () => {
  const base = { id: 'c1', userId: 'u1', userName: 'Ali', userImage: null, text: 'hi', createdAt: new Date().toISOString() }

  it('still parses a comment from an old server (no reply fields)', () => {
    expect(() => CommentItem.parse(base)).not.toThrow()
  })

  it('parses a reply with parentId, replyToUserName and deleted', () => {
    const r = CommentItem.parse({ ...base, parentId: 'p1', replyToUserName: 'Abu', replyToUserId: 'u9', deleted: false })
    expect(r.parentId).toBe('p1')
    expect(r.replyToUserId).toBe('u9')
    expect(r.replyToUserName).toBe('Abu')
  })

  it('PostCommentRequest accepts an optional parentId, and none', () => {
    expect(PostCommentRequest.parse({ text: 'a' })).toEqual({ text: 'a' })
    expect(PostCommentRequest.parse({ text: 'a', parentId: 'p1' }).parentId).toBe('p1')
    expect(() => PostCommentRequest.parse({ text: 'a', parentId: '' })).toThrow()
  })

  it('NotificationItem accepts the optional isReply flag on a COMMENT, and omits it for old servers', () => {
    const n = {
      type: 'COMMENT' as const, actorId: 'u1', actorName: 'Bob', actorImage: null,
      catchId: 'c1', catchPhotoUrl: null, catchSpeciesName: null,
      kolamId: null, kolamName: null, rank: null, rejectionReason: null,
      createdAt: new Date().toISOString(), unread: true,
    }
    expect(NotificationItem.parse({ ...n, isReply: true }).isReply).toBe(true)
    expect(NotificationItem.parse(n).isReply).toBeUndefined()
  })
})

describe('FriendsFeedItem.spotLocation', () => {
  it('is optional, so an older server response still parses', async () => {
    const { FriendsFeedItem } = await import('../src/social')
    expect(FriendsFeedItem.shape.spotLocation.isOptional()).toBe(true)
    expect(FriendsFeedItem.shape.spotLocation.unwrap().isNullable()).toBe(true)
  })
})
