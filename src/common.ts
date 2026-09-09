import { z } from 'zod'

// Shared primitives, matching the conventions documented in Jom-Mancing-Server's
// prisma/schema.prisma: money as integer sen, weight in grams, length in millimetres.

export const SenAmount = z.number().int().nonnegative()

// Global valid ranges, deliberately not a Malaysia bounding box — anglers fish across
// the Thai and Singaporean borders, and a too-tight box would reject a legitimate pin
// with a validation error they cannot act on.
export const Latitude = z.number().min(-90).max(90)
export const Longitude = z.number().min(-180).max(180)

// Mirrors the SpotType enum in Jom-Mancing-Server's prisma/schema.prisma. Kept in sync
// by hand: the generated Prisma client lives server-side and the app cannot import it.
export const SpotType = z.enum(['LAUT', 'SUNGAI', 'TASIK', 'EMPANGAN', 'KOLAM'])
export type SpotType = z.infer<typeof SpotType>

// The angler's unique handle, distinct from `name` (a free-text display name two
// anglers may well share). Normalised to lowercase here rather than compared
// case-insensitively at the database, so `User.username` holds exactly one spelling and
// a plain unique index is the whole enforcement — "Ali" and "ali" cannot coexist.
//
// Order matters: trim and toLowerCase are transforms zod applies before the checks
// below them, so " Ali_99 " reaches the regex as "ali_99" and passes.
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 20
export const USERNAME_RULES = 'Use 3-20 characters: lowercase letters, numbers and underscores only.'

export const Username = z
  .string()
  .trim()
  .toLowerCase()
  .min(USERNAME_MIN_LENGTH, USERNAME_RULES)
  .max(USERNAME_MAX_LENGTH, USERNAME_RULES)
  .regex(/^[a-z0-9_]+$/, USERNAME_RULES)
export type Username = z.infer<typeof Username>

// How long an angler must wait between username changes. The first username — picked at
// signup or on the pick-a-username screen — does not start the clock; only a change
// does, so a signup typo is not locked in for a week. Lives here so the app's "you can
// change this again on ..." copy and the server's enforcement read one number.
export const USERNAME_CHANGE_COOLDOWN_DAYS = 7

export const ErrorResponse = z.object({
  error: z.string(),
})
export type ErrorResponse = z.infer<typeof ErrorResponse>

// The 13 states plus 3 federal territories, in the order a Malaysian picker expects
// (alphabetical, federal territories last). This is the codebase's first canonical list
// of them: `state` is free text on User, Kolam and Spot alike, and stays that way —
// onboarding simply only ever writes one of these values into User.state.
export const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'W.P. Kuala Lumpur',
  'W.P. Labuan',
  'W.P. Putrajaya',
] as const

export const MalaysianState = z.enum(MALAYSIAN_STATES)
export type MalaysianState = z.infer<typeof MalaysianState>

// Mirrors the ExperienceLevel enum in Jom-Mancing-Server's prisma/schema.prisma, kept
// in sync by hand like SpotType above. Drives which of three hardcoded sentences the
// chatbot's system prompt includes — see the server's lib/gemini.ts.
export const ExperienceLevel = z.enum(['BEGINNER', 'CASUAL', 'OTAI'])
export type ExperienceLevel = z.infer<typeof ExperienceLevel>
