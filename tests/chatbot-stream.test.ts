import { describe, it, expect } from 'vitest'
import { ChatStreamEvent } from '../src/chatbot'

const reply = { id: 'm1', role: 'ASSISTANT', content: 'hi', createdAt: '2026-10-06T00:00:00.000Z' }

describe('ChatStreamEvent', () => {
  it.each([
    { type: 'step', step: 'THINKING' },
    { type: 'step', step: 'SEARCH_KOLAM', label: 'Selangor' },
    { type: 'text', delta: 'Untuk patin' },
    { type: 'done', threadId: 't1', reply },
    { type: 'error', message: 'Digital Otai sedang sibuk — cuba lagi sekejap.' },
  ])('accepts $type', (event) => {
    expect(ChatStreamEvent.safeParse(event).success).toBe(true)
  })

  it('rejects an unknown type', () => {
    expect(ChatStreamEvent.safeParse({ type: 'ping' }).success).toBe(false)
  })

  it('rejects an unknown step code', () => {
    expect(ChatStreamEvent.safeParse({ type: 'step', step: 'DANCING' }).success).toBe(false)
  })
})
