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
  // Open status, computed server-side against one instant for the whole response —
  // same convention as isFeatured above (see lib/promotions.ts). Wall-clock hours are
  // judged in Asia/Kuala_Lumpur, never server local time.
  //
  // hasHours distinguishes "we know this kolam is shut for the rest of today" from
  // "we have no hours data for this kolam at all". Without it the UI would render
  // every unparsed kolam as closed, which is worse than showing no line.
  hasHours: z.boolean(),
  openNow: z.boolean(),
  opensAt: z.string().nullable(), // "07:00" when closed now but opening later today
  closesAt: z.string().nullable(), // "18:00" when currently open
})
export type KolamPin = z.infer<typeof KolamPin>

export const MapPinsResponse = z.object({
  pins: z.array(KolamPin),
})
export type MapPinsResponse = z.infer<typeof MapPinsResponse>
