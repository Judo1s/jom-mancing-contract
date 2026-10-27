import { describe, it, expect } from 'vitest'
import { CreateCatchRequest } from '../src/catch-log'

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
