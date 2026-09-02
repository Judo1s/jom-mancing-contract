import { describe, it, expect } from 'vitest'
import {
  UpdateKolamProfileRequest,
  ReplaceKolamHoursRequest,
  CreateStockReleaseRequest,
  CreateKolamPhotoRequest,
  VerifyCatchRequest,
} from '../src/kolam'

describe('UpdateKolamProfileRequest', () => {
  it('accepts a partial update', () => {
    expect(() => UpdateKolamProfileRequest.parse({ phone: '012-3456789' })).not.toThrow()
  })

  it('accepts an empty object (no fields changed)', () => {
    expect(() => UpdateKolamProfileRequest.parse({})).not.toThrow()
  })

  it('rejects a non-array rules field', () => {
    expect(() => UpdateKolamProfileRequest.parse({ rules: 'no barbless hooks' })).toThrow()
  })
})

describe('ReplaceKolamHoursRequest', () => {
  it('accepts one row per day of week', () => {
    const hours = Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, opensAt: '07:00', closesAt: '19:00' }))
    expect(() => ReplaceKolamHoursRequest.parse({ hours })).not.toThrow()
  })

  it('rejects duplicate dayOfWeek entries', () => {
    const hours = [
      { dayOfWeek: 0, opensAt: '07:00', closesAt: '19:00' },
      { dayOfWeek: 0, opensAt: '08:00', closesAt: '20:00' },
    ]
    expect(() => ReplaceKolamHoursRequest.parse({ hours })).toThrow()
  })

  it('rejects a dayOfWeek outside 0-6', () => {
    const hours = [{ dayOfWeek: 7, opensAt: '07:00', closesAt: '19:00' }]
    expect(() => ReplaceKolamHoursRequest.parse({ hours })).toThrow()
  })
})

describe('CreateStockReleaseRequest', () => {
  it('accepts a release with no species (free-text note only)', () => {
    expect(() =>
      CreateStockReleaseRequest.parse({ releasedAt: new Date().toISOString(), note: '200kg rohu, morning release' }),
    ).not.toThrow()
  })

  it('requires releasedAt', () => {
    expect(() => CreateStockReleaseRequest.parse({ note: 'no date given' })).toThrow()
  })

  it('rejects a non-integer quantityKg', () => {
    expect(() =>
      CreateStockReleaseRequest.parse({ releasedAt: new Date().toISOString(), quantityKg: 200.5 }),
    ).toThrow()
  })
})

describe('CreateKolamPhotoRequest', () => {
  it('requires a non-empty url', () => {
    expect(() => CreateKolamPhotoRequest.parse({ url: '' })).toThrow()
  })

  it('accepts a url with no explicit order', () => {
    expect(() => CreateKolamPhotoRequest.parse({ url: 'https://cdn.example.com/a.jpg' })).not.toThrow()
  })
})

describe('VerifyCatchRequest', () => {
  it('accepts a bare VERIFIED', () => {
    expect(VerifyCatchRequest.safeParse({ status: 'VERIFIED' }).success).toBe(true)
  })

  it('requires a reason when rejecting', () => {
    const result = VerifyCatchRequest.safeParse({ status: 'REJECTED' })
    expect(result.success).toBe(false)
  })

  it('accepts REJECTED with a reason', () => {
    const result = VerifyCatchRequest.safeParse({
      status: 'REJECTED',
      rejectionReason: 'Photo shows a different pond',
    })
    expect(result.success).toBe(true)
  })

  // A reason on an approval is a copy-paste slip, not a silent no-op: it would be
  // stored and shown to the angler under a "Verified" badge.
  it('rejects a reason attached to VERIFIED', () => {
    const result = VerifyCatchRequest.safeParse({
      status: 'VERIFIED',
      rejectionReason: 'oops',
    })
    expect(result.success).toBe(false)
  })

  it('rejects PENDING — an owner decision is always terminal', () => {
    expect(VerifyCatchRequest.safeParse({ status: 'PENDING' }).success).toBe(false)
  })
})
