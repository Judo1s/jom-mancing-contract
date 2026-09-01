import { describe, it, expect } from 'vitest'
import { AdminAction, AdminRoleUpdateRequest, AdminUserListResponse } from '../src/admin'

describe('AdminRoleUpdateRequest', () => {
  it('accepts a role and a reason', () => {
    const parsed = AdminRoleUpdateRequest.parse({ role: 'KOLAM_OWNER', reason: 'Owns Kolam Sri Muda' })
    expect(parsed.role).toBe('KOLAM_OWNER')
  })

  it('rejects an empty or whitespace-only reason', () => {
    expect(() => AdminRoleUpdateRequest.parse({ role: 'ANGLER', reason: '' })).toThrow()
    expect(() => AdminRoleUpdateRequest.parse({ role: 'ANGLER', reason: '   ' })).toThrow()
  })

  it('rejects a role outside the enum', () => {
    expect(() => AdminRoleUpdateRequest.parse({ role: 'SUPERUSER', reason: 'x' })).toThrow()
  })
})

describe('AdminAction', () => {
  it('includes the slice-A action', () => {
    expect(AdminAction.parse('USER_ROLE_CHANGED')).toBe('USER_ROLE_CHANGED')
  })
})

describe('AdminUserListResponse', () => {
  it('allows a null nextCursor on the final page', () => {
    const parsed = AdminUserListResponse.parse({ items: [], nextCursor: null })
    expect(parsed.nextCursor).toBeNull()
  })
})
