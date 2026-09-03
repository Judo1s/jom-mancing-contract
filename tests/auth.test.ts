import { describe, it, expect } from 'vitest'
import { AuthUser } from '../src/auth'

describe('AuthUser.role', () => {
  const base = {
    id: 'u1',
    email: 'owner@example.com',
    name: 'Shop Owner',
    username: 'shop_owner',
    image: null,
    bio: null,
    state: null,
  }

  it('accepts SHOP_OWNER', () => {
    expect(AuthUser.parse({ ...base, role: 'SHOP_OWNER' }).role).toBe('SHOP_OWNER')
  })

  it('still accepts the three original roles', () => {
    for (const role of ['ANGLER', 'KOLAM_OWNER', 'ADMIN'] as const) {
      expect(AuthUser.parse({ ...base, role }).role).toBe(role)
    }
  })

  it('rejects an unknown role', () => {
    expect(() => AuthUser.parse({ ...base, role: 'WIZARD' })).toThrow()
  })
})
