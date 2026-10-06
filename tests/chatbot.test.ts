import { describe, it, expect } from 'vitest'
import { ChatMediaItem, ChatMessageItem } from '../src/chatbot'

const base = { id: 'm1', role: 'ASSISTANT', content: 'hi', createdAt: '2026-10-06T00:00:00.000Z' }

const species = {
  type: 'SPECIES', speciesId: 's1', malayName: 'Haruan', englishName: 'Striped snakehead',
  scientificName: 'Channa striata', imageUrl: 'https://r2/x.jpg', imageCredit: 'Foto: A / Wikimedia Commons, CC BY-SA 4.0',
}
const video = { type: 'YOUTUBE_VIDEO', videoId: 'dQw4w9WgXcQ', title: 'Cara', channelTitle: 'Otai', thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' }
const catchPhoto = { type: 'CATCH_PHOTO', catchId: 'c1', imageUrl: 'https://r2/c.jpg', speciesName: 'Patin', weightGrams: 3200, kolamName: null }
const kolam = { type: 'KOLAM', kolamId: 'k1', name: 'Kolam A', state: 'Selangor', avgRating: 4.5, thumbnailUrl: null }

describe('ChatMessageItem', () => {
  it('parses a message without media (old server / pre-feature rows)', () => {
    const parsed = ChatMessageItem.parse(base)
    expect(parsed.media).toBeUndefined()
  })

  it('parses a message carrying every media type', () => {
    const parsed = ChatMessageItem.parse({ ...base, media: [species, video, catchPhoto, kolam] })
    expect(parsed.media?.map((m) => m.type)).toEqual(['SPECIES', 'YOUTUBE_VIDEO', 'CATCH_PHOTO', 'KOLAM'])
  })
})

describe('ChatMediaItem', () => {
  it.each([species, video, catchPhoto, kolam])('accepts $type', (item) => {
    expect(ChatMediaItem.safeParse(item).success).toBe(true)
  })

  it('rejects an unknown type', () => {
    expect(ChatMediaItem.safeParse({ type: 'GIF', url: 'x' }).success).toBe(false)
  })

  it('rejects a species photo with no imageUrl', () => {
    const { imageUrl: _drop, ...rest } = species
    expect(ChatMediaItem.safeParse(rest).success).toBe(false)
  })
})
