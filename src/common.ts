import { z } from 'zod'

// Shared primitives, matching the conventions documented in Jom-Mancing-Server's
// prisma/schema.prisma: money as integer sen, weight in grams, length in millimetres.

export const SenAmount = z.number().int().nonnegative()

export const ErrorResponse = z.object({
  error: z.string(),
})
export type ErrorResponse = z.infer<typeof ErrorResponse>
