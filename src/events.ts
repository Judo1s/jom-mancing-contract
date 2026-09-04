import { z } from 'zod'

// GET /api/events — upcoming tournaments at published spots, for Home's Events rail.
// Read-only: no create/edit flow exists in the app (kolam-owner dashboards are
// deferred, see Jom-Mancing-App/docs/decision-log.md #17); Tournament rows are
// managed directly in the database, same as isFeatured/isPromoted elsewhere.
export const EventItem = z.object({
  id: z.string(),
  spotId: z.string(),
  spotName: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startsAt: z.string(), // ISO datetime
  endsAt: z.string(), // ISO datetime
  entryFeeSen: z.number().int().nullable(),
  prizePoolSen: z.number().int().nullable(),
  contactPhone: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isPromoted: z.boolean(),
  // Coordinates travel with every event so the detail screen can offer directions
  // without a second fetch, and so the list can show distance when the requester
  // supplied their position.
  latitude: z.number(),
  longitude: z.number(),
  state: z.string().nullable(),
  // Present only when the request supplied lat/lng. Great-circle km from requester to
  // host spot; null otherwise, never 0-as-unknown.
  distanceKm: z.number().nullable(),
})
export type EventItem = z.infer<typeof EventItem>

export const EventListResponse = z.object({
  events: z.array(EventItem),
  // Opaque cursor for the next page; null on the last page. Promoted rows pinned to
  // page 1 take no part in cursor arithmetic — see the server's tournament-query.ts.
  nextCursor: z.string().nullable(),
})
export type EventListResponse = z.infer<typeof EventListResponse>

export const EventDetailResponse = z.object({
  event: EventItem.extend({
    /// From Spot.address.
    address: z.string().nullable(),
    /// From the host Kolam, NOT the Spot — googleMapsUrl is a Kolam column, and a
    /// tournament's spot is not guaranteed to have a Kolam row. buildDirectionsOptions
    /// already treats it as optional and falls back to lat/lng.
    googleMapsUrl: z.string().nullable(),
    /// The host Kolam's id, or null when the spot has no kolam row. The app's
    /// KolamDetail route keys on Kolam.id, NOT Spot.id — passing spotId there would
    /// 404. Null means the detail screen hides the "host kolam" link entirely.
    kolamId: z.string().nullable(),
  }),
})
export type EventDetailResponse = z.infer<typeof EventDetailResponse>
