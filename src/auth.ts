import { z } from 'zod'

// POST /api/auth/register
export const RegisterRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})
export type RegisterRequest = z.infer<typeof RegisterRequest>

// POST /api/auth/callback/credentials (Auth.js Credentials provider)
export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginRequest = z.infer<typeof LoginRequest>

export const AuthUser = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  role: z.enum(['ANGLER', 'KOLAM_OWNER', 'ADMIN']),
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
