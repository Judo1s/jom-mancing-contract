import { describe, it, expect } from 'vitest'
import { Username, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../src/common'
import { RegisterRequest } from '../src/auth'
import { SetUsernameRequest } from '../src/profile'

describe('Username', () => {
  it('accepts lowercase letters, digits and underscores', () => {
    expect(Username.parse('ali_rahman99')).toBe('ali_rahman99')
  })

  it('normalises case, so Ali and ali are the same username', () => {
    expect(Username.parse('AliRahman')).toBe('alirahman')
  })

  it('trims surrounding whitespace before validating', () => {
    expect(Username.parse('  ali_rahman  ')).toBe('ali_rahman')
  })

  it('accepts the exact length bounds', () => {
    expect(Username.parse('a'.repeat(USERNAME_MIN_LENGTH))).toHaveLength(USERNAME_MIN_LENGTH)
    expect(Username.parse('a'.repeat(USERNAME_MAX_LENGTH))).toHaveLength(USERNAME_MAX_LENGTH)
  })

  it('rejects anything outside those bounds', () => {
    expect(() => Username.parse('a'.repeat(USERNAME_MIN_LENGTH - 1))).toThrow()
    expect(() => Username.parse('a'.repeat(USERNAME_MAX_LENGTH + 1))).toThrow()
  })

  it('rejects characters outside a-z 0-9 _', () => {
    for (const bad of ['ali rahman', 'ali.rahman', 'ali-rahman', 'ali@rahman', 'ali/rahman', 'ali😀']) {
      expect(() => Username.parse(bad), bad).toThrow()
    }
  })
})

describe('RegisterRequest.username', () => {
  const base = { email: 'ali@example.com', password: 'hunter2hunter2', name: 'Ali' }

  it('is required and normalised', () => {
    expect(RegisterRequest.parse({ ...base, username: ' Ali_99 ' }).username).toBe('ali_99')
  })

  it('rejects a signup with no username', () => {
    expect(() => RegisterRequest.parse(base)).toThrow()
  })
})

describe('SetUsernameRequest', () => {
  it('carries a single normalised username', () => {
    expect(SetUsernameRequest.parse({ username: 'ALI_99' })).toEqual({ username: 'ali_99' })
  })
})
