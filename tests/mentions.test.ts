import { describe, it, expect } from 'vitest'
import { extractMentions, MAX_MENTIONS_PER_TEXT } from '../src/common'
import { NotificationItem, UserIdByUsernameResponse } from '../src/social'

describe('extractMentions', () => {
  it('finds handles at the start, middle and end', () => {
    expect(extractMentions('@ali nice one @abu_99, thanks @siti')).toEqual(['ali', 'abu_99', 'siti'])
  })

  it('lowercases and dedupes', () => {
    expect(extractMentions('@Ali @ALI @ali')).toEqual(['ali'])
  })

  it('ignores email addresses', () => {
    expect(extractMentions('mail ali@example.com or a@b.com')).toEqual([])
  })

  it('stops at punctuation', () => {
    expect(extractMentions('(@ali), @abu! @siti. @man?')).toEqual(['ali', 'abu', 'siti', 'man'])
  })

  it('rejects handles outside the username length rules', () => {
    expect(extractMentions('@ab @' + 'a'.repeat(21))).toEqual([])
    expect(extractMentions('@' + 'a'.repeat(20))).toEqual(['a'.repeat(20)])
  })

  it('ignores a bare @ and @@', () => {
    expect(extractMentions('@ @@ali')).toEqual([])
  })

  it('caps the count', () => {
    const text = Array.from({ length: 15 }, (_, i) => `@user${i}`).join(' ')
    expect(extractMentions(text)).toHaveLength(MAX_MENTIONS_PER_TEXT)
  })

  it('is safe to call repeatedly (global regex state)', () => {
    expect(extractMentions('@ali')).toEqual(['ali'])
    expect(extractMentions('@ali')).toEqual(['ali'])
  })
})

describe('mention schemas', () => {
  const base = {
    type: 'COMMENT' as const,
    actorId: 'u1', actorName: 'Ali', actorImage: null, catchId: 'c1', catchPhotoUrl: null,
    catchSpeciesName: null, kolamId: null, kolamName: null, rank: null, rejectionReason: null,
    createdAt: '2026-11-20T00:00:00.000Z', unread: true,
  }

  it('NotificationItem accepts mention POST/COMMENT/null and its absence', () => {
    for (const mention of ['POST', 'COMMENT', null, undefined]) {
      expect(() => NotificationItem.parse({ ...base, mention })).not.toThrow()
    }
    expect(() => NotificationItem.parse({ ...base, mention: 'OTHER' })).toThrow()
  })

  it('UserIdByUsernameResponse is just an id', () => {
    expect(UserIdByUsernameResponse.parse({ id: 'u1' })).toEqual({ id: 'u1' })
  })
})
