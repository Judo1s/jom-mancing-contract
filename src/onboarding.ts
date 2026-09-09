import { z } from 'zod'
import { ExperienceLevel, MalaysianState } from './common'

// POST /api/onboarding — the single write that ends the onboarding stack. Steps 2-6 are
// held in an in-memory draft on the device and submitted together, so a flaky connection
// costs one retry rather than leaving the account half-configured.
//
// Responds with AuthUser (see auth.ts), whose onboardingCompletedAt the app uses to
// dismiss the gate.

// Five is a prompt budget, not a taste limit: these names are interpolated into Digital
// Otai's system instruction, and an unbounded list is an unbounded prompt.
export const MAX_TARGET_SPECIES = 5

export const CompleteOnboardingRequest = z.object({
  state: MalaysianState,
  experienceLevel: ExperienceLevel,
  // Zero is legal. Step 4 is blocking and depends on GET /api/species; if that call
  // fails (a Neon cold start is the realistic case), the app offers "Continue without
  // picking" rather than trapping the angler behind a failed request. The 1-minimum is
  // a UI rule that applies only when the catalog actually loaded.
  targetSpeciesIds: z
    .array(z.string().min(1))
    .max(MAX_TARGET_SPECIES)
    .refine((ids) => new Set(ids).size === ids.length, 'Duplicate species id'),
  // Step 6 is skippable, so both arrive absent when skipped and null when cleared —
  // same shape UpdateProfileRequest already uses for bio.
  bio: z.string().trim().nullable().optional(),
  image: z.string().nullable().optional(),
})
export type CompleteOnboardingRequest = z.infer<typeof CompleteOnboardingRequest>
