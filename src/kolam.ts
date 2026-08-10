import { z } from 'zod'
import { SenAmount } from './common'

// GET /api/kolam/:id

export const KolamPricingItem = z.object({
  label: z.string(),
  priceSen: SenAmount,
  unit: z.string().nullable(),
})
export type KolamPricingItem = z.infer<typeof KolamPricingItem>

export const KolamHoursItem = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string(),
  closesAt: z.string(),
})
export type KolamHoursItem = z.infer<typeof KolamHoursItem>

export const KolamPhotoItem = z.object({
  url: z.string(),
  order: z.number().int(),
})
export type KolamPhotoItem = z.infer<typeof KolamPhotoItem>

// "Waktu ikan turun" — restock history/schedule, past and upcoming.
export const KolamStockReleaseItem = z.object({
  releasedAt: z.string(), // ISO datetime
  speciesName: z.string().nullable(),
  quantityKg: z.number().nullable(),
  note: z.string().nullable(),
})
export type KolamStockReleaseItem = z.infer<typeof KolamStockReleaseItem>

export const KolamDetail = z.object({
  id: z.string(),
  spotId: z.string(),
  name: z.string(),
  state: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  rules: z.array(z.string()),
  amenities: z.array(z.string()),
  isFeatured: z.boolean(),
  avgRating: z.number().nullable(),
  reviewCount: z.number().int(),
  pricing: z.array(KolamPricingItem),
  hours: z.array(KolamHoursItem),
  photos: z.array(KolamPhotoItem),
  stockReleases: z.array(KolamStockReleaseItem),
})
export type KolamDetail = z.infer<typeof KolamDetail>

// GET /api/kolam/:id/leaderboard
export const LeaderboardEntry = z.object({
  rank: z.number().int(),
  catchId: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  speciesName: z.string().nullable(),
  weightGrams: z.number().int().nullable(),
  lengthMm: z.number().int().nullable(),
  caughtAt: z.string(), // ISO datetime
})
export type LeaderboardEntry = z.infer<typeof LeaderboardEntry>

export const KolamLeaderboardResponse = z.object({
  entries: z.array(LeaderboardEntry),
})
export type KolamLeaderboardResponse = z.infer<typeof KolamLeaderboardResponse>
