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

export const ErrorResponse = z.object({
  error: z.string(),
})
export type ErrorResponse = z.infer<typeof ErrorResponse>
