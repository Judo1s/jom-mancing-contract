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
  photoUrl: z.string().nullable().optional(),
  weightGrams: z.number().int().positive().nullable().optional(),
  lengthMm: z.number().int().positive().nullable().optional(),
  baitUsed: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  caughtAt: z.string(), // ISO datetime
})
export type CreateCatchRequest = z.infer<typeof CreateCatchRequest>

export const CatchStatus = z.enum(['PENDING', 'VERIFIED', 'REJECTED'])
export type CatchStatus = z.infer<typeof CatchStatus>

// GET /api/catches/me
export const CatchLogItem = z.object({
  id: z.string(),
  title: z.string().nullable(),
  speciesName: z.string().nullable(),
  spotName: z.string().nullable(),
  photoUrl: z.string().nullable(),
  weightGrams: z.number().int().nullable(),
  lengthMm: z.number().int().nullable(),
  baitUsed: z.string().nullable(),
  note: z.string().nullable(),
  caughtAt: z.string(), // ISO datetime
  status: CatchStatus,
})
export type CatchLogItem = z.infer<typeof CatchLogItem>

export const CatchLogListResponse = z.object({
  catches: z.array(CatchLogItem),
})
export type CatchLogListResponse = z.infer<typeof CatchLogListResponse>
