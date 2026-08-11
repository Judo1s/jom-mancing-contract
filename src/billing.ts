import { z } from 'zod'

// GET /api/billing/status
export const BillingStatusResponse = z.object({
  isPremium: z.boolean(),
  currentPeriodEnd: z.string().nullable(), // ISO datetime
  savedSpotLimit: z.number().int().nullable(), // null == unlimited (premium)
})
export type BillingStatusResponse = z.infer<typeof BillingStatusResponse>

// POST /api/billing/upgrade — flips a Subscription row (decision-log.md #7 / the
// Assumptions section: paywall UI, not a real payment provider).
export const UpgradeResponse = z.object({
  isPremium: z.literal(true),
  currentPeriodEnd: z.string(), // ISO datetime
})
export type UpgradeResponse = z.infer<typeof UpgradeResponse>
