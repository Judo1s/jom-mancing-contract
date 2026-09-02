import { describe, it, expect } from 'vitest'
import {
  AdminAction,
  AdminAssignableRole,
  AdminAuditLogEntry,
  AdminAuditLogResponse,
  AdminRoleUpdateRequest,
  AdminUserDetail,
  AdminUserListResponse,
} from '../src/admin'

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

describe('AdminAssignableRole', () => {
  it('rejects an unknown role', () => {
    expect(() => AdminAssignableRole.parse('SUPERUSER')).toThrow()
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

const validUserDetail = {
  id: 'user-1',
  name: 'Ah Chong',
  email: 'ahchong@example.com',
  role: 'ANGLER' as const,
  image: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  bio: null,
  state: 'Selangor',
  ownedKolam: [],
  subscriptions: [],
  recentCatches: [
    {
      id: 'catch-1',
      speciesName: 'Toman',
      caughtAt: '2026-01-02T00:00:00.000Z',
      status: 'VERIFIED',
    },
  ],
}

describe('AdminUserDetail', () => {
  it('parses a full valid object including a recentCatches entry', () => {
    const parsed = AdminUserDetail.parse(validUserDetail)
    expect(parsed.recentCatches[0].status).toBe('VERIFIED')
  })

  it('rejects an invalid recentCatches status', () => {
    const invalid = {
      ...validUserDetail,
      recentCatches: [{ ...validUserDetail.recentCatches[0], status: 'MAYBE' }],
    }
    expect(() => AdminUserDetail.parse(invalid)).toThrow()
  })
})

describe('AdminAuditLogEntry', () => {
  it('accepts a null actorEmail and a null reason', () => {
    const parsed = AdminAuditLogEntry.parse({
      id: 'log-1',
      actorId: 'admin-1',
      actorEmail: null,
      action: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: 'user-1',
      reason: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    expect(parsed.actorEmail).toBeNull()
    expect(parsed.reason).toBeNull()
  })
})

describe('AdminAuditLogResponse', () => {
  it('accepts a null nextCursor', () => {
    const parsed = AdminAuditLogResponse.parse({ items: [], nextCursor: null })
    expect(parsed.nextCursor).toBeNull()
  })

  it('rejects a missing items field', () => {
    expect(() => AdminAuditLogResponse.parse({ nextCursor: null })).toThrow()
  })
})
