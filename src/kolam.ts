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
  address: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  category: z.string().nullable(),
  website: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
  rules: z.array(z.string()),
  amenities: z.array(z.string()),
  isFeatured: z.boolean(),
  avgRating: z.number().nullable(),
  reviewCount: z.number().int(),
  pricing: z.array(KolamPricingItem),
  hours: z.array(KolamHoursItem),
  photos: z.array(KolamPhotoItem),
  stockReleases: z.array(KolamStockReleaseItem),
  // false for an anonymous request (no bearer token) as well as "not saved".
  isSaved: z.boolean(),
})
export type KolamDetail = z.infer<typeof KolamDetail>

// POST/DELETE /api/kolam/:id/save
export const SaveSpotResponse = z.object({
  isSaved: z.boolean(),
  savedSpotLimit: z.number().int().nullable(), // null == unlimited (premium)
})
export type SaveSpotResponse = z.infer<typeof SaveSpotResponse>

export const SaveSpotLimitError = z.object({
  error: z.literal('SAVED_SPOT_LIMIT_REACHED'),
  savedSpotLimit: z.number().int(),
})
export type SaveSpotLimitError = z.infer<typeof SaveSpotLimitError>

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

// GET /api/kolam/mine
export const KolamMineItem = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string().nullable(),
  category: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  avgRating: z.number().nullable(),
  reviewCount: z.number().int(),
})
export type KolamMineItem = z.infer<typeof KolamMineItem>

export const KolamMineListResponse = z.object({
  kolams: z.array(KolamMineItem),
})
export type KolamMineListResponse = z.infer<typeof KolamMineListResponse>

// PATCH /api/kolam/:id — owner-editable profile fields. All optional: send only what
// changed, same "partial update" shape as UpdateProfileRequest in auth.ts.
export const UpdateKolamProfileRequest = z.object({
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  googleMapsUrl: z.string().nullable().optional(),
  rules: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
})
export type UpdateKolamProfileRequest = z.infer<typeof UpdateKolamProfileRequest>

// PUT /api/kolam/:id/hours — full replace. Rejects duplicate dayOfWeek values up
// front rather than letting KolamHours's @@unique([kolamId, dayOfWeek]) constraint
// fail the whole request with an opaque Prisma error.
export const ReplaceKolamHoursRequest = z
  .object({
    hours: z.array(KolamHoursItem),
  })
  .refine((data) => new Set(data.hours.map((h) => h.dayOfWeek)).size === data.hours.length, {
    message: 'Duplicate dayOfWeek values are not allowed',
    path: ['hours'],
  })
export type ReplaceKolamHoursRequest = z.infer<typeof ReplaceKolamHoursRequest>

export const KolamHoursResponse = z.object({
  hours: z.array(KolamHoursItem),
})
export type KolamHoursResponse = z.infer<typeof KolamHoursResponse>

// PUT /api/kolam/:id/pricing — full replace.
export const ReplaceKolamPricingRequest = z.object({
  pricing: z.array(KolamPricingItem),
})
export type ReplaceKolamPricingRequest = z.infer<typeof ReplaceKolamPricingRequest>

export const KolamPricingResponse = z.object({
  pricing: z.array(KolamPricingItem),
})
export type KolamPricingResponse = z.infer<typeof KolamPricingResponse>

// POST /api/kolam/:id/stock-releases. speciesId is optional and, when given, must
// name an existing Species row (validated server-side) — v1 has no species-picker
// endpoint, so an owner who doesn't set it just describes the release via `note`.
export const CreateStockReleaseRequest = z.object({
  releasedAt: z.string(), // ISO datetime
  speciesId: z.string().nullable().optional(),
  quantityKg: z.number().int().nullable().optional(),
  note: z.string().nullable().optional(),
})
export type CreateStockReleaseRequest = z.infer<typeof CreateStockReleaseRequest>

// Distinct from KolamStockReleaseItem (used in the public KolamDetail response,
// which has no need for a row id) — this one carries `id` so the owner dashboard can
// target a specific release for deletion.
export const KolamStockReleaseManageItem = z.object({
  id: z.string(),
  releasedAt: z.string(),
  speciesId: z.string().nullable(),
  speciesName: z.string().nullable(),
  quantityKg: z.number().nullable(),
  note: z.string().nullable(),
})
export type KolamStockReleaseManageItem = z.infer<typeof KolamStockReleaseManageItem>

export const KolamStockReleasesResponse = z.object({
  stockReleases: z.array(KolamStockReleaseManageItem),
})
export type KolamStockReleasesResponse = z.infer<typeof KolamStockReleasesResponse>

// POST /api/kolam/:id/photos/presign — same presigned-PUT pattern as
// POST /api/uploads/presign, scoped to kolam owners instead of anglers.
export const PresignKolamPhotoRequest = z.object({
  contentType: z.string().min(1),
})
export type PresignKolamPhotoRequest = z.infer<typeof PresignKolamPhotoRequest>

export const PresignKolamPhotoResponse = z.object({
  uploadUrl: z.string(),
  publicUrl: z.string(),
})
export type PresignKolamPhotoResponse = z.infer<typeof PresignKolamPhotoResponse>

// POST /api/kolam/:id/photos — called after the client PUTs bytes to the presigned
// URL above, same two-step pattern as catch-log photos.
export const CreateKolamPhotoRequest = z.object({
  url: z.string().min(1),
  order: z.number().int().nonnegative().optional(),
})
export type CreateKolamPhotoRequest = z.infer<typeof CreateKolamPhotoRequest>

// Distinct from KolamPhotoItem (public KolamDetail response, no id) for the same
// reason as KolamStockReleaseManageItem above.
export const KolamPhotoManageItem = z.object({
  id: z.string(),
  url: z.string(),
  order: z.number().int(),
})
export type KolamPhotoManageItem = z.infer<typeof KolamPhotoManageItem>

export const KolamPhotosResponse = z.object({
  photos: z.array(KolamPhotoManageItem),
})
export type KolamPhotosResponse = z.infer<typeof KolamPhotosResponse>

// GET /api/kolam/[id]/catches — the owner's verification queue.
//
// Photos are the only evidence an owner has for a catch they did not personally weigh,
// so they are part of this projection rather than something the dashboard fetches
// separately.
export const PendingCatchItem = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  title: z.string().nullable(),
  speciesName: z.string().nullable(),
  photoUrls: z.array(z.string()),
  weightGrams: z.number().int().nullable(),
  lengthMm: z.number().int().nullable(),
  caughtAt: z.string(), // ISO datetime
})
export type PendingCatchItem = z.infer<typeof PendingCatchItem>

export const KolamPendingCatchesResponse = z.object({
  catches: z.array(PendingCatchItem),
})
export type KolamPendingCatchesResponse = z.infer<typeof KolamPendingCatchesResponse>

// PATCH /api/kolam/[id]/catches/[catchId] — an owner's decision on one catch.
//
// PENDING is deliberately absent: this endpoint records a decision, and "undecide" is
// not one. A catch returns to PENDING only via the resolver, when the angler edits the
// spot or the weight (see lib/catch-verification).
//
// The reason is required on REJECTED and forbidden on VERIFIED. Without the first half
// a rejection is silent and the angler cannot tell it from a bug; without the second, a
// stray reason would be stored and shown beneath a "Verified" badge.
export const VerifyCatchRequest = z
  .object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    rejectionReason: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === 'REJECTED' && !value.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message: 'A reason is required when rejecting a catch',
      })
    }
    if (value.status === 'VERIFIED' && value.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message: 'A rejection reason cannot accompany a verified catch',
      })
    }
  })
export type VerifyCatchRequest = z.infer<typeof VerifyCatchRequest>
