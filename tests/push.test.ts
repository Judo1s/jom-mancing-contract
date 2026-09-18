import { describe, it, expect } from 'vitest'
import { RegisterPushTokenRequest } from '../src/push'

describe('RegisterPushTokenRequest', () => {
  it('accepts an Expo push token with a platform', () => {
    expect(() =>
      RegisterPushTokenRequest.parse({ token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]', platform: 'android' }),
    ).not.toThrow()
  })

  it('rejects an empty token', () => {
    expect(() => RegisterPushTokenRequest.parse({ token: '', platform: 'ios' })).toThrow()
  })

  it('rejects a platform outside ios/android', () => {
    expect(() => RegisterPushTokenRequest.parse({ token: 'ExponentPushToken[abc]', platform: 'web' })).toThrow()
  })
})
