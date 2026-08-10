import { z } from 'zod'

// GET /api/species
export const SpeciesItem = z.object({
  id: z.string(),
  malayName: z.string(),
  englishName: z.string().nullable(),
})
export type SpeciesItem = z.infer<typeof SpeciesItem>

export const SpeciesListResponse = z.object({
  species: z.array(SpeciesItem),
})
export type SpeciesListResponse = z.infer<typeof SpeciesListResponse>

// POST /api/uploads/presign — scoped to the 'catches' folder for now (the only
// user-facing upload flow so far; kolam-photos are still seeded/managed directly).
export const PresignUploadRequest = z.object({
  contentType: z.string().min(1),
})
export type PresignUploadRequest = z.infer<typeof PresignUploadRequest>

export const PresignUploadResponse = z.object({
  uploadUrl: z.string(),
  publicUrl: z.string(),
})
export type PresignUploadResponse = z.infer<typeof PresignUploadResponse>

// POST /api/catches
export const CreateCatchRequest = z.object({
  speciesId: z.string().nullable().optional(),
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
