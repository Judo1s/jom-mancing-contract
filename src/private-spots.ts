import { z } from 'zod'
import { Latitude, Longitude, SpotType } from './common'

// A private spot is a pin the angler dropped for themselves — the hidden pond or
// stretch of river they do not want on the public map. Stored as a Spot row with
// `ownerId` set (see the migration comment in Jom-Mancing-Server); nothing but the
// owner's own requests ever reads one back.
//
// Distinct from a *saved* spot (profile.ts), which is a bookmark pointing at somebody
// else's published kolam. Two mechanics, two caps: 3 bookmarks free, 1 private spot
// free — see FREE_SAVED_SPOT_CAP / FREE_PRIVATE_SPOT_CAP in the server's entitlements.

export const PrivateSpotItem = z.object({
  id: z.string(),
  name: z.string(),
  type: SpotType,
  latitude: Latitude,
  longitude: Longitude,
  // The owner's own access notes — "park behind the surau, gate open after 6". Never
  // carried over when a spot is promoted to the public catalogue; see PromoteSpotRequest.
  note: z.string().nullable(),
  createdAt: z.string(), // ISO datetime
})
export type PrivateSpotItem = z.infer<typeof PrivateSpotItem>

// Every response below carries the cap alongside the data. The Map screen needs to know
// on first load whether the "add a spot" button should open the placement UI or go
// straight to the paywall, and folding it in here saves that screen a second round trip.
const capFields = {
  privateSpotCount: z.number().int(),
  privateSpotLimit: z.number().int().nullable(), // null == unlimited (premium)
}

// The caps on their own — the whole body of DELETE /api/private-spots/:id, which has no
// spot left to return but still owes the client a refreshed slot count.
export const PrivateSpotCapsResponse = z.object(capFields)
export type PrivateSpotCapsResponse = z.infer<typeof PrivateSpotCapsResponse>

// GET /api/private-spots
export const PrivateSpotListResponse = z.object({
  spots: z.array(PrivateSpotItem),
  ...capFields,
})
export type PrivateSpotListResponse = z.infer<typeof PrivateSpotListResponse>

// Shared by POST /api/private-spots and PATCH /api/private-spots/:id.
export const PrivateSpotResponse = z.object({
  spot: PrivateSpotItem,
  ...capFields,
})
export type PrivateSpotResponse = z.infer<typeof PrivateSpotResponse>

// POST /api/private-spots
export const CreatePrivateSpotRequest = z.object({
  name: z.string().trim().min(1).max(80),
  type: SpotType,
  latitude: Latitude,
  longitude: Longitude,
  note: z.string().trim().max(500).nullable().optional(),
  // The free tier keeps one private spot *at a time*, so hitting the cap offers a swap
  // rather than a dead end. Naming the spot being replaced here makes that swap one
  // atomic request: the server deletes and creates in a single transaction, so a failed
  // create can never leave the angler with neither spot.
  replaceSpotId: z.string().optional(),
})
export type CreatePrivateSpotRequest = z.infer<typeof CreatePrivateSpotRequest>

// PATCH /api/private-spots/:id — every field optional; omitted ones are left alone.
// `note` is nullable to allow clearing it, which `.optional()` alone cannot express.
export const UpdatePrivateSpotRequest = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  type: SpotType.optional(),
  latitude: Latitude.optional(),
  longitude: Longitude.optional(),
  note: z.string().trim().max(500).nullable().optional(),
})
export type UpdatePrivateSpotRequest = z.infer<typeof UpdatePrivateSpotRequest>

// 403 from POST /api/private-spots when the free cap is already used and no
// `replaceSpotId` was given. Same shape as kolam.ts's SaveSpotLimitError so the app can
// treat both paywall trips identically.
export const PrivateSpotLimitError = z.object({
  error: z.literal('PRIVATE_SPOT_LIMIT_REACHED'),
  privateSpotLimit: z.number().int(),
})
export type PrivateSpotLimitError = z.infer<typeof PrivateSpotLimitError>

// POST /api/private-spots/:id/promote — hand a secret spot over to the community.
//
// The row keeps its id and simply stops being private, so any catches already logged
// against it stay attached. It lands unpublished, in the same moderation queue as any
// other community contribution, and the angler is recorded as its contributor.
//
// The private `note` is deliberately NOT reused as the public description: it is access
// knowledge written for an audience of one. The description below is asked for fresh.
export const PromoteSpotRequest = z.object({
  description: z.string().trim().max(1000).nullable().optional(),
  state: z.string().trim().max(60).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
})
export type PromoteSpotRequest = z.infer<typeof PromoteSpotRequest>

// Promotion frees the owner's private slot, so the caps come back here too — a free
// angler who contributes their spot can immediately pin another.
export const PromoteSpotResponse = z.object({
  spotId: z.string(),
  // Always false: promotion submits for review, it does not publish.
  isPublished: z.literal(false),
  ...capFields,
})
export type PromoteSpotResponse = z.infer<typeof PromoteSpotResponse>
