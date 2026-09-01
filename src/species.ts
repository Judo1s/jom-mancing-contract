import { z } from 'zod'

// Curated species catalog — distinct from Catch.speciesName (free text, too many
// local name variants to gate — see catch-log.ts) and Kolam stock releases already
// referencing Species.id. This powers a picker for the kolam-owner admin dashboard's
// stock-release form specifically, not the mobile catch-logging flow.

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

// POST /api/species — lets a kolam owner add a species that isn't in the catalog yet
// when recording a stock release. Idempotent on malayName: creating one that already
// exists (case-insensitive) returns the existing row instead of erroring or duplicating.
export const CreateSpeciesRequest = z.object({
  malayName: z.string().min(1),
  englishName: z.string().nullable().optional(),
})
export type CreateSpeciesRequest = z.infer<typeof CreateSpeciesRequest>
