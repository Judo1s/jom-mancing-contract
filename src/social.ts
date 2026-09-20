import { z } from 'zod'

// GET /api/users/search?q=
export const AnglerSummary = z.object({
  id: z.string(),
  name: z.string().nullable(),
  // Display names are not unique — two anglers may both be "Ali" — so the handle is
  // what tells search results apart.
  username: z.string().nullable(),
  image: z.string().nullable(),
  isFollowing: z.boolean(),
})
export type AnglerSummary = z.infer<typeof AnglerSummary>

// Also reused as-is for GET /api/users/[id]/followers and /following — same
// requester-relative `isFollowing` shape, just a different base list.
export const UserSearchResponse = z.object({
  users: z.array(AnglerSummary),
})
export type UserSearchResponse = z.infer<typeof UserSearchResponse>

// GET /api/feed/friends — every published catch, any author (public feed), newest
// first. Name kept for now — see the route's own comment.
export const FriendsFeedItem = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  title: z.string().nullable(),
  speciesName: z.string().nullable(),
  // First photo; `photoUrls` is the full set the feed carousel pages through.
  photoUrl: z.string().nullable(),
  photoUrls: z.array(z.string()),
  weightGrams: z.number().int().nullable(),
  lengthMm: z.number().int().nullable(),
  baitUsed: z.string().nullable(),
  note: z.string().nullable(),
  // Where it was caught, for the location chip on the post. Null when the angler
  // pinned no spot — the picker is optional.
  //
  // Safe to expose despite Spot.ownerId privacy: every read that fills this goes
  // through FEED_CATCH_WHERE (which excludes catches at anybody's private spot) or
  // is the viewer's own catch, where the spot is already theirs. See lib/catches.ts.
  //
  // Name only, deliberately no coordinates: the feed is public, and a lat/lng here
  // would be the exact leak the CATCH_NOT_AT_PRIVATE_SPOT comment warns about the
  // moment the visibility rule above is ever loosened.
  spotName: z.string().nullable(),
  caughtAt: z.string(), // ISO datetime
  strikeCount: z.number().int(),
  struckByMe: z.boolean(),
  commentCount: z.number().int(),
  // False for the requester's own catches too, alongside anyone else not followed —
  // callers should also check userId against the signed-in user before showing a
  // Follow button, since this flag alone doesn't distinguish "me" from "a stranger".
  isFollowing: z.boolean(),
})
export type FriendsFeedItem = z.infer<typeof FriendsFeedItem>

export const FriendsFeedResponse = z.object({
  catches: z.array(FriendsFeedItem),
})
export type FriendsFeedResponse = z.infer<typeof FriendsFeedResponse>

// POST/DELETE /api/catches/:id/strike — "Strike" is this app's kudos-style like.
export const StrikeResponse = z.object({
  struck: z.boolean(),
  strikeCount: z.number().int(),
})
export type StrikeResponse = z.infer<typeof StrikeResponse>

// GET/POST /api/catches/:id/comments
export const CommentItem = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  text: z.string(),
  createdAt: z.string(), // ISO datetime
})
export type CommentItem = z.infer<typeof CommentItem>

export const CatchCommentsResponse = z.object({
  comments: z.array(CommentItem),
})
export type CatchCommentsResponse = z.infer<typeof CatchCommentsResponse>

export const PostCommentRequest = z.object({
  text: z.string().trim().min(1).max(500),
})
export type PostCommentRequest = z.infer<typeof PostCommentRequest>

// GET /api/notifications — derived live from Strike/Follow/Comment, not a stored
// table (see decision-log context in Jom-Mancing-Server's schema.prisma comment on
// User.notificationsCheckedAt).
// STRIKE/FOLLOW/COMMENT are derived from their own tables; the two CATCH_* values are
// derived from Catch.status leaving PENDING. See Jom-Mancing-Server's lib/notifications.
export const NotificationType = z.enum([
  'STRIKE',
  'FOLLOW',
  'COMMENT',
  'CATCH_VERIFIED',
  'CATCH_REJECTED',
  // No human actor, unlike every type above — see the profile-kolam-rankings design
  // spec §3 for why that's a deliberate departure rather than an oversight.
  'RANK_ENTERED_PODIUM',
  'RANK_LEFT_PODIUM',
  // A kolam the viewer saved logged a stock release. Actor-less like the two rank
  // types above, and for the same reason — a pond taking delivery of fish is not
  // something another angler did to you. Derived from StockRelease joined to the
  // viewer's SavedSpot rows; see Jom-Mancing-Server's lib/notifications.
  'RESTOCK',
])
export type NotificationType = z.infer<typeof NotificationType>

export const NotificationItem = z.object({
  type: NotificationType,
  // Null on RANK_ENTERED_PODIUM/RANK_LEFT_PODIUM — those have no human actor — and
  // deliberately null on CATCH_VERIFIED/CATCH_REJECTED too, even though a human did
  // decide those. A decision can come from the kolam's owner OR from internal staff
  // working the cross-kolam queue, and naming staff to the angler they just rejected
  // puts a real person's name and face on a judgement the organisation made. The
  // decision is the organisation's; the individual is not the angler's business.
  actorId: z.string().nullable(),
  actorName: z.string().nullable(),
  actorImage: z.string().nullable(),
  catchId: z.string().nullable(),
  catchPhotoUrl: z.string().nullable(),
  catchSpeciesName: z.string().nullable(),
  // Populated on RANK_ENTERED_PODIUM/RANK_LEFT_PODIUM and RESTOCK; null otherwise.
  kolamId: z.string().nullable(),
  kolamName: z.string().nullable(),
  rank: z.number().int().nullable(),
  // Only ever set on CATCH_REJECTED, and only when the decider gave a reason (they are
  // required to — see VerifyCatchRequest). Carried here rather than left for the catch
  // detail screen alone: an unexplained rejection with no actor to ask is the worst of
  // both worlds, so the reason travels with the notification that delivers the news.
  rejectionReason: z.string().nullable(),
  createdAt: z.string(), // ISO datetime
  unread: z.boolean(),
})
export type NotificationItem = z.infer<typeof NotificationItem>

export const NotificationsResponse = z.object({
  notifications: z.array(NotificationItem),
})
export type NotificationsResponse = z.infer<typeof NotificationsResponse>

export const UnreadCountResponse = z.object({
  count: z.number().int(),
})
export type UnreadCountResponse = z.infer<typeof UnreadCountResponse>

// POST /api/kolam/:id/reviews — upsert, since a user has at most one review per kolam.
export const SubmitReviewRequest = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
})
export type SubmitReviewRequest = z.infer<typeof SubmitReviewRequest>
