import { z } from 'zod'

// POST /api/uploads/presign — 'catches' (default) or 'profile'. kolam-photos stay
// out of reach of this user-facing endpoint; they're still seeded/managed directly.
export const PresignUploadRequest = z.object({
  contentType: z.string().min(1),
  folder: z.enum(['catches', 'profile']).default('catches'),
})
export type PresignUploadRequest = z.infer<typeof PresignUploadRequest>

export const PresignUploadResponse = z.object({
  uploadUrl: z.string(),
  publicUrl: z.string(),
})
export type PresignUploadResponse = z.infer<typeof PresignUploadResponse>

// POST /api/catches
export const CreateCatchRequest = z.object({
  title: z.string().trim().min(1).max(120).nullable().optional(),
  // Free text, not a picker off the Species lookup table — there are far too many
  // local fish names/variants for a fixed list to cover.
  speciesName: z.string().trim().min(1).nullable().optional(),
  spotId: z.string().nullable().optional(),
  // A catch carries up to MAX_CATCH_PHOTOS images. `photoUrl` is the first of them,
  // kept as its own field so app builds released before multi-photo keep rendering
  // (and so the notification thumbnail query stays a single column read).
  photoUrl: z.string().nullable().optional(),
  photoUrls: z.array(z.string()).max(5).optional(),
  weightGrams: z.number().int().positive().nullable().optional(),
  lengthMm: z.number().int().positive().nullable().optional(),
  baitUsed: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  caughtAt: z.string(), // ISO datetime
  // "Publish to the Activity feed" vs "just log it" toggle on the create form —
  // defaults to published, matching the pre-toggle behavior.
  published: z.boolean().default(true),
  // Opt-in to a kolam's leaderboard, shown as its own toggle only when the picked spot
  // is a kolam. Defaults true so the common case (auto-verify at an unowned kolam)
  // stays a single tap, same reasoning as `published` defaulting to shown. Independent
  // of `spotId`: false keeps the location on the catch but the resolver leaves it
  // PENDING forever, so it never ranks and never reaches an owner's queue — see
  // resolveCatchVerification.
  submittedForVerification: z.boolean().default(true),
})
export type CreateCatchRequest = z.infer<typeof CreateCatchRequest>

// Caps the picker's selectionLimit, the create/update payload, and the carousel.
export const MAX_CATCH_PHOTOS = 5

export const CatchStatus = z.enum(['PENDING', 'VERIFIED', 'REJECTED'])
export type CatchStatus = z.infer<typeof CatchStatus>

// What the pinned spot is, for the client to decide whether the leaderboard toggle
// applies at all — a bare spotId/spotName can't tell a kolam from a private pin.
// 'other' covers the rare non-kolam public spot (e.g. a river) that predates or falls
// outside SpotPicker's kolam-or-private listing; the client treats it like 'private'
// (no leaderboard, hide the toggle).
export const SpotKind = z.enum(['kolam', 'private', 'other'])
export type SpotKind = z.infer<typeof SpotKind>

// GET /api/catches/me
export const CatchLogItem = z.object({
  id: z.string(),
  title: z.string().nullable(),
  speciesName: z.string().nullable(),
  spotName: z.string().nullable(),
  // The pinned spot's id, not just its name. `spotName` alone is not enough: the app's
  // edit form is built entirely from a CatchLogItem and PATCH writes
  // `spotId: body.spotId ?? null`, so without this an angler editing any field of a
  // pinned catch would silently unpin it from the kolam and drop off the leaderboard.
  spotId: z.string().nullable(),
  // Null when spotId is null. Lets the edit form show/hide the leaderboard toggle
  // without a second round trip — see the CreateCatchRequest note on
  // submittedForVerification.
  spotKind: SpotKind.nullable(),
  photoUrl: z.string().nullable(),
  photoUrls: z.array(z.string()),
  weightGrams: z.number().int().nullable(),
  lengthMm: z.number().int().nullable(),
  baitUsed: z.string().nullable(),
  note: z.string().nullable(),
  caughtAt: z.string(), // ISO datetime
  status: CatchStatus,
  // Set only on a REJECTED catch — the owner's reason, shown to the angler on their
  // catch log so a rejection is not indistinguishable from a bug.
  rejectionReason: z.string().nullable(),
  published: z.boolean(),
  submittedForVerification: z.boolean(),
})
export type CatchLogItem = z.infer<typeof CatchLogItem>

export const CatchLogListResponse = z.object({
  catches: z.array(CatchLogItem),
})
export type CatchLogListResponse = z.infer<typeof CatchLogListResponse>
