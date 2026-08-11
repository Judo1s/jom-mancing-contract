import { z } from 'zod'

// Shared between GET /api/profile/me's preview (top 3) and GET /api/saved-spots' full list.
export const SavedSpotItem = z.object({
  spotId: z.string(),
  kolamId: z.string().nullable(), // null would mean a non-kolam Spot; save flow is kolam-only today.
  name: z.string(),
  state: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  savedAt: z.string(), // ISO datetime
})
export type SavedSpotItem = z.infer<typeof SavedSpotItem>

// GET /api/saved-spots
export const SavedSpotListResponse = z.object({
  spots: z.array(SavedSpotItem),
})
export type SavedSpotListResponse = z.infer<typeof SavedSpotListResponse>

export const ProfileStats = z.object({
  totalCatches: z.number().int(),
  speciesCount: z.number().int(),
  biggestCatchGrams: z.number().int().nullable(),
})
export type ProfileStats = z.infer<typeof ProfileStats>

// GET /api/profile/me
export const ProfileResponse = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  state: z.string().nullable(),
  isPremium: z.boolean(),
  stats: ProfileStats,
  followerCount: z.number().int(),
  followingCount: z.number().int(),
  // Top 3, newest-saved first — full list is GET /api/saved-spots.
  savedSpotsPreview: z.array(SavedSpotItem),
  savedSpotCount: z.number().int(),
  savedSpotLimit: z.number().int().nullable(), // null == unlimited (premium)
})
export type ProfileResponse = z.infer<typeof ProfileResponse>

// PATCH /api/profile/me
export const UpdateProfileRequest = z.object({
  name: z.string().trim().min(1).optional(),
  bio: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  image: z.string().nullable().optional(),
})
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequest>
