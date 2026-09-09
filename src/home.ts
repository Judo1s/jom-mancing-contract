import { z } from 'zod'
import { KolamPin } from './map'

// GET /api/home?lat=&lng= — the ranked shortlist behind Home's Kolam section.
// A KolamPin plus how far away it is. distanceKm is null when the request carried no
// coordinates, in which case `nearest` is ordered by featured-then-rating instead.
export const HomeKolamItem = KolamPin.extend({
  distanceKm: z.number().nullable(),
})
export type HomeKolamItem = z.infer<typeof HomeKolamItem>

export const HomeRailResponse = z.object({
  // The Home shortlist, ordered by distance ascending (capped server-side — see
  // kolam-ranking's NEAREST_COUNT). Home's decision module derives its Nearby /
  // Open now / Top rated segments from this one list.
  nearest: z.array(HomeKolamItem),
  // Every kolam whose paid window is live right now, by distance. May overlap
  // `nearest` — the same kolam can be both the closest and a paying advertiser.
  featured: z.array(HomeKolamItem),
  // False when the request carried no coordinates. Drives the header's
  // "Enable location" state, so the fallback is never silent.
  usedLocation: z.boolean(),
})
export type HomeRailResponse = z.infer<typeof HomeRailResponse>
