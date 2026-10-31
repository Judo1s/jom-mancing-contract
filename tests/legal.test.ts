import { describe, it, expect } from 'vitest'
import { AcceptTermsRequest, CURRENT_TERMS_VERSION } from '../src/legal'
import { AuthUser } from '../src/auth'

describe('AcceptTermsRequest', () => {
  it('accepts a version string', () => {
    expect(AcceptTermsRequest.parse({ version: CURRENT_TERMS_VERSION })).toEqual({ version: CURRENT_TERMS_VERSION })
  })

  it('rejects a missing or empty version', () => {
    expect(() => AcceptTermsRequest.parse({})).toThrow()
    expect(() => AcceptTermsRequest.parse({ version: '' })).toThrow()
  })
})

describe('AuthUser.termsAcceptedVersion', () => {
  const user = {
    id: 'u1', email: 'a@b.co', name: null, username: 'ali', role: 'ANGLER',
    image: null, bio: null, state: null, onboardingCompletedAt: null,
  }

  it('is required, so a server that forgets it fails the contract', () => {
    expect(() => AuthUser.parse(user)).toThrow()
    expect(AuthUser.parse({ ...user, termsAcceptedVersion: null }).termsAcceptedVersion).toBeNull()
    expect(AuthUser.parse({ ...user, termsAcceptedVersion: CURRENT_TERMS_VERSION }).termsAcceptedVersion).toBe(CURRENT_TERMS_VERSION)
  })
})
