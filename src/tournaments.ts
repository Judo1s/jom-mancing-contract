import { z } from 'zod'

// Moderation-aware tournament shapes. Deliberately a separate file from events.ts:
// EventItem is the public shape, and keeping these apart means no public type can
// inherit a moderation or promotion field by extension.

export const TournamentStatus = z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'])
export type TournamentStatus = z.infer<typeof TournamentStatus>

export const EventSort = z.enum(['soonest', 'prize', 'cheapest', 'distance'])
export type EventSort = z.infer<typeof EventSort>

export const EventWhen = z.enum(['upcoming', 'past'])
export type EventWhen = z.infer<typeof EventWhen>

// Parsed from URLSearchParams, so every numeric/boolean field coerces from a string.
export const EventListQuery = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  when: EventWhen.default('upcoming'),
  state: z.string().trim().min(1).max(40).optional(),
  freeOnly: z.coerce.boolean().optional(),
  maxEntryFeeSen: z.coerce.number().int().nonnegative().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  sort: EventSort.default('soonest'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})
export type EventListQuery = z.infer<typeof EventListQuery>

// What an owner sees in their dashboard. Carries status and the rejection reason —
// their only route to understanding what to fix — but never promotion fields.
export const OwnerTournament = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  entryFeeSen: z.number().int().nullable(),
  prizePoolSen: z.number().int().nullable(),
  contactPhone: z.string().nullable(),
  imageUrl: z.string().nullable(),
  status: TournamentStatus,
  reviewedAt: z.string().nullable(),
  reviewNote: z.string().nullable(),
})
export type OwnerTournament = z.infer<typeof OwnerTournament>

export const OwnerTournamentListResponse = z.object({ tournaments: z.array(OwnerTournament) })
export type OwnerTournamentListResponse = z.infer<typeof OwnerTournamentListResponse>

// Staff see everything the owner sees, plus who reviewed it and the paid placement.
export const AdminTournament = OwnerTournament.extend({
  spotId: z.string(),
  spotName: z.string(),
  reviewedById: z.string().nullable(),
  isPromoted: z.boolean(),
  promotedUntil: z.string().nullable(),
})
export type AdminTournament = z.infer<typeof AdminTournament>

export const AdminTournamentListResponse = z.object({
  tournaments: z.array(AdminTournament),
  nextCursor: z.string().nullable(),
})
export type AdminTournamentListResponse = z.infer<typeof AdminTournamentListResponse>

/// Note what is absent: status, isPromoted, promotedUntil, reviewedById, reviewNote.
/// These are not ignored-if-present — z.object strips unknown keys, so an owner who
/// posts them gets a parsed body that never contained them. Promotion is staff-only,
/// and status moves only through the submit/withdraw/review endpoints.
export const CreateTournamentRequest = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(2000).nullable().optional(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    entryFeeSen: z.number().int().nonnegative().nullable().optional(),
    prizePoolSen: z.number().int().nonnegative().nullable().optional(),
    contactPhone: z.string().trim().max(30).nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
  })
  .refine((t) => new Date(t.endsAt) > new Date(t.startsAt), {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  })
export type CreateTournamentRequest = z.infer<typeof CreateTournamentRequest>

// .partial() cannot be called on a ZodEffects (the .refine above), so the base object is
// re-declared here rather than derived. The endsAt > startsAt rule is re-checked in the
// route against the merged row, because a PATCH may change only one of the two dates and
// a body-only check cannot see the other.
export const UpdateTournamentRequest = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(2000).nullable(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    entryFeeSen: z.number().int().nonnegative().nullable(),
    prizePoolSen: z.number().int().nonnegative().nullable(),
    contactPhone: z.string().trim().max(30).nullable(),
    imageUrl: z.string().url().nullable(),
  })
  .partial()
export type UpdateTournamentRequest = z.infer<typeof UpdateTournamentRequest>

// Reject and takedown both require a reason; approve does not, so it takes no body.
export const ReviewTournamentRequest = z.object({ reason: z.string().trim().min(3).max(500) })
export type ReviewTournamentRequest = z.infer<typeof ReviewTournamentRequest>

// isPromoted true with a null promotedUntil is exactly what lib/promotions treats as
// not-promoted, so accepting it would let staff believe they had sold a live placement.
export const SetTournamentPromotionRequest = z
  .object({
    isPromoted: z.boolean(),
    promotedUntil: z.string().datetime().nullable(),
  })
  .refine((p) => !p.isPromoted || p.promotedUntil !== null, {
    message: 'promotedUntil is required when isPromoted is true',
    path: ['promotedUntil'],
  })
export type SetTournamentPromotionRequest = z.infer<typeof SetTournamentPromotionRequest>
