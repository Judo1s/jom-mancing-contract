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
  isPromoted: z.boolean(),
})
export type EventItem = z.infer<typeof EventItem>

export const EventListResponse = z.object({
  events: z.array(EventItem),
})
export type EventListResponse = z.infer<typeof EventListResponse>
