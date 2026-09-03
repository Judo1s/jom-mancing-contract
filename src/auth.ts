import { z } from 'zod'
import { Username } from './common'

// POST /api/auth/register
export const RegisterRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  username: Username,
})
export type RegisterRequest = z.infer<typeof RegisterRequest>

// POST /api/auth/callback/credentials (Auth.js Credentials provider)
export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginRequest = z.infer<typeof LoginRequest>

// POST /api/auth/google. idToken is the Google-signed ID token obtained on-device via
// expo-auth-session's Google provider; the server verifies its signature and audience
// before trusting anything in it.
export const GoogleAuthRequest = z.object({
  idToken: z.string().min(1),
})
export type GoogleAuthRequest = z.infer<typeof GoogleAuthRequest>

export const AuthUser = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  // Null means this account has never picked a handle — Google sign-ins and every
  // account created before usernames existed. The app treats that as "not finished
  // signing up" and shows the pick-a-username screen instead of the tabs.
  username: z.string().nullable(),
  role: z.enum(['ANGLER', 'KOLAM_OWNER', 'SHOP_OWNER', 'ADMIN']),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  state: z.string().nullable(),
})
export type AuthUser = z.infer<typeof AuthUser>

// Shared response shape for both register and login: a bearer JWT the app stores in
// expo-secure-store and sends as `Authorization: Bearer <token>` on subsequent calls.
export const AuthResponse = z.object({
  token: z.string(),
  user: AuthUser,
})
export type AuthResponse = z.infer<typeof AuthResponse>
