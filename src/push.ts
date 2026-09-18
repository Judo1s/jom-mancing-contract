import { z } from 'zod'

// POST/DELETE /api/push-tokens — the app registers its Expo push token after sign-in
// and again on every launch (the token can rotate), and unregisters on logout. The
// server upserts by token, so repeat registrations are free.
//
// The token travels in the body rather than a URL path on both verbs: an Expo push
// token is literally `ExponentPushToken[xxxx]`, and square brackets in a path segment
// invite encoding bugs for no benefit.
export const RegisterPushTokenRequest = z.object({
  // Shape is validated for real server-side by Expo.isExpoPushToken, which owns the
  // rule. This bound only rejects empty strings and absurd lengths.
  token: z.string().min(1).max(256),
  platform: z.enum(['ios', 'android']),
})
export type RegisterPushTokenRequest = z.infer<typeof RegisterPushTokenRequest>
