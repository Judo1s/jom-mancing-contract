import { z } from 'zod'

// GET /api/users/search?q=
export const AnglerSummary = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  isFollowing: z.boolean(),
})
export type AnglerSummary = z.infer<typeof AnglerSummary>

export const UserSearchResponse = z.object({
  users: z.array(AnglerSummary),
})
export type UserSearchResponse = z.infer<typeof UserSearchResponse>

// GET /api/feed/friends — catches from users the requester follows.
export const FriendsFeedItem = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  speciesName: z.string().nullable(),
  photoUrl: z.string().nullable(),
  weightGrams: z.number().int().nullable(),
  lengthMm: z.number().int().nullable(),
  note: z.string().nullable(),
  caughtAt: z.string(), // ISO datetime
  strikeCount: z.number().int(),
  struckByMe: z.boolean(),
  commentCount: z.number().int(),
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

// POST /api/kolam/:id/reviews — upsert, since a user has at most one review per kolam.
export const SubmitReviewRequest = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
})
export type SubmitReviewRequest = z.infer<typeof SubmitReviewRequest>
