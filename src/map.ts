import { z } from 'zod'

// GET /api/map — pins for every published kolam, for the Map screen.
export const KolamPin = z.object({
  kolamId: z.string(),
  spotId: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  isFeatured: z.boolean(),
  avgRating: z.number().nullable(),
  category: z.string().nullable(),
  // First kolam photo, for surfaces that show pins as cards rather than map markers
  // (Home's kolam rail). Null when the kolam has no photos uploaded yet.
  thumbnailUrl: z.string().nullable(),
})
export type KolamPin = z.infer<typeof KolamPin>

export const MapPinsResponse = z.object({
  pins: z.array(KolamPin),
})
export type MapPinsResponse = z.infer<typeof MapPinsResponse>
