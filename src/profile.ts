import { z } from 'zod'
import { ExperienceLevel, Username } from './common'
import { MAX_TARGET_SPECIES } from './onboarding'

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

// Social profile links an angler may attach to their account — all optional, all
// public. Shared between ProfileResponse and PublicProfileResponse so the owner's own
// view and everyone else's view of the same account never drift.
export const SocialLinks = z.object({
  instagramUrl: z.string().nullable(),
  facebookUrl: z.string().nullable(),
  tiktokUrl: z.string().nullable(),
  youtubeUrl: z.string().nullable(),
})
export type SocialLinks = z.infer<typeof SocialLinks>

// GET /api/profile/me
export const ProfileResponse = z.object({
  id: z.string(),
  name: z.string().nullable(),
  role: z.enum(['ANGLER', 'KOLAM_OWNER', 'SHOP_OWNER', 'ADMIN']),
  username: z.string().nullable(),
  // When this angler may next change their username, computed server-side from the
  // cooldown so the app never re-does that arithmetic. Null means "right now" — either
  // no change has ever been made, or the cooldown has already elapsed.
  usernameChangeableAt: z.string().nullable(), // ISO datetime
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
  // Read back for the profile editor's own form. Not on AuthUser, which carries only
  // onboardingCompletedAt — the gate is all the app needs at auth time.
  experienceLevel: ExperienceLevel.nullable(),
  targetSpeciesIds: z.array(z.string()),
}).extend(SocialLinks.shape)
export type ProfileResponse = z.infer<typeof ProfileResponse>

// GET /api/users/[id]/profile — a public, non-owner read of another angler's
// profile. Deliberately narrower than ProfileResponse: no email, and no saved-spot
// data, which stays private to the account owner.
export const PublicProfileResponse = z.object({
  id: z.string(),
  name: z.string().nullable(),
  role: z.enum(['ANGLER', 'KOLAM_OWNER', 'SHOP_OWNER', 'ADMIN']),
  username: z.string().nullable(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  state: z.string().nullable(),
  isPremium: z.boolean(),
  stats: ProfileStats,
  followerCount: z.number().int(),
  followingCount: z.number().int(),
  // Relative to the requester, not the profile owner.
  isFollowing: z.boolean(),
}).extend(SocialLinks.shape)
export type PublicProfileResponse = z.infer<typeof PublicProfileResponse>

// PATCH /api/profile/me. Deliberately no `username` here: a username change is rate
// limited and can collide, so it has failure modes (409 taken, 429 too soon) the rest of
// this form has no way to report per-field. It gets its own endpoint below.
export const UpdateProfileRequest = z.object({
  name: z.string().trim().min(1).optional(),
  bio: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  image: z.string().nullable().optional(),
  // Both also settable here, not only through onboarding: the migration backfills
  // onboardingCompletedAt for every pre-existing account, so those anglers never see
  // the flow and would otherwise have no way to set these at all. It is also the only
  // way to change an answer after onboarding.
  experienceLevel: ExperienceLevel.nullable().optional(),
  targetSpeciesIds: z.array(z.string().min(1)).max(MAX_TARGET_SPECIES).optional(),
}).extend({
  // Each a full URL or null (never '') — the app converts an emptied field to null
  // before sending, same as bio/state, so a link can only ever be a valid link or absent.
  instagramUrl: z.string().trim().url().nullable().optional(),
  facebookUrl: z.string().trim().url().nullable().optional(),
  tiktokUrl: z.string().trim().url().nullable().optional(),
  youtubeUrl: z.string().trim().url().nullable().optional(),
})
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequest>

// PUT /api/profile/username — used both for the first pick (from null) and for later
// changes. Responds with the full ProfileResponse so the caller's cached user updates in
// the same round trip; 409 if taken, 429 if inside the cooldown.
export const SetUsernameRequest = z.object({
  username: Username,
})
export type SetUsernameRequest = z.infer<typeof SetUsernameRequest>

// 429 body for a change attempted inside the cooldown. `error` matches ErrorResponse so
// the app's generic error handling still reads it; the date is the extra the username
// field needs to explain itself.
export const UsernameCooldownResponse = z.object({
  error: z.string(),
  nextChangeAllowedAt: z.string(), // ISO datetime
})
export type UsernameCooldownResponse = z.infer<typeof UsernameCooldownResponse>

// GET /api/users/username-available?u= — public, so the signup form can check before
// submitting. Usernames are public identifiers shown on every profile, so answering
// this reveals nothing an account page would not.
export const UsernameAvailabilityResponse = z.object({
  username: z.string(),
  available: z.boolean(),
})
export type UsernameAvailabilityResponse = z.infer<typeof UsernameAvailabilityResponse>
