import { describe, it, expect } from 'vitest'
import { AdminAction, AdminPendingCatchItem, AdminPendingCatchesResponse, AdminSummary } from '../src/admin'

describe('AdminPendingCatchItem', () => {
  it('carries the kolam identity an owner-scoped item does not need', () => {
    const parsed = AdminPendingCatchItem.parse({
      id: 'c1',
      userId: 'u1',
      userName: 'Haq',
      userImage: null,
      title: 'Strike lagi',
      speciesName: 'Patin Mekong',
      photoUrls: ['https://example.com/a.jpg'],
      weightGrams: 5000,
      lengthMm: 200,
      caughtAt: '2026-09-20T00:00:00.000Z',
      kolamId: 'k1',
      kolamName: 'Kolam Sungai',
    })
    expect(parsed.kolamName).toBe('Kolam Sungai')
  })

  it('rejects an item with no kolam name — the queue column would be blank', () => {
    expect(() =>
      AdminPendingCatchItem.parse({
        id: 'c1', userId: 'u1', userName: null, userImage: null, title: null,
        speciesName: null, photoUrls: [], weightGrams: null, lengthMm: null,
        caughtAt: '2026-09-20T00:00:00.000Z', kolamId: 'k1',
      }),
    ).toThrow()
  })
})

describe('AdminPendingCatchesResponse', () => {
  it('carries a nextCursor for paging', () => {
    const parsed = AdminPendingCatchesResponse.parse({ catches: [], nextCursor: null })
    expect(parsed.nextCursor).toBeNull()
  })
})

describe('AdminAction', () => {
  it('includes the two catch decisions', () => {
    expect(AdminAction.parse('CATCH_VERIFIED')).toBe('CATCH_VERIFIED')
    expect(AdminAction.parse('CATCH_REJECTED')).toBe('CATCH_REJECTED')
  })
})

describe('AdminSummary', () => {
  it('reports the verification queue depth', () => {
    const parsed = AdminSummary.parse({
      kolamTotal: 126, kolamMissingPricing: 125, kolamMissingOwner: 122,
      kolamMissingHours: 0, kolamMissingPhotos: 0, kolamUnpublished: 0,
      shopTotal: 0, shopMissingOwner: 0, pendingCatches: 3,
    })
    expect(parsed.pendingCatches).toBe(3)
  })
})
