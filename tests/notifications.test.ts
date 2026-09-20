import { describe, it, expect } from 'vitest'
import { NotificationItem, NotificationType } from '../src/social'

const socialItem = {
  type: 'STRIKE' as const,
  actorId: 'user_1',
  actorName: 'Ali',
  actorImage: null,
  catchId: 'catch_1',
  catchPhotoUrl: null,
  catchSpeciesName: 'Rohu',
  kolamId: null,
  kolamName: null,
  rank: null,
  rejectionReason: null,
  createdAt: '2026-09-18T02:00:00.000Z',
  unread: true,
}

describe('NotificationType', () => {
  it('includes RESTOCK', () => {
    expect(() => NotificationType.parse('RESTOCK')).not.toThrow()
  })
})

describe('NotificationItem', () => {
  it('accepts a social notification with a kolam-free payload', () => {
    expect(() => NotificationItem.parse(socialItem)).not.toThrow()
  })

  // A restock has no actor — nobody did it to you. The podium types established this
  // shape; RESTOCK reuses it, with a null rank since no standing changed.
  it('accepts a restock notification with a null actor and a kolam', () => {
    expect(() =>
      NotificationItem.parse({
        ...socialItem,
        type: 'RESTOCK',
        actorId: null,
        actorName: null,
        catchId: null,
        catchSpeciesName: null,
        kolamId: 'kolam_1',
        kolamName: 'Kolam Pak Man',
        rank: null,
        rejectionReason: null,
      }),
    ).not.toThrow()
  })
})
