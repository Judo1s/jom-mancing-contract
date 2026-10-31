import { z } from 'zod'
import { CatchStatus } from './catch-log'
import { SpotType } from './common'

// Internal admin surface. See jom-mancing-admin's
// docs/superpowers/specs/2026-09-01-internal-admin-foundation-design.md.

// The audit log's action vocabulary. A plain String column in Postgres, an enum here —
// slices B, C and D extend this list without a database migration, while every call
// site stays type-checked.
export const AdminAction = z.enum([
  'USER_ROLE_CHANGED',
  // Slice B — listings and ownership.
  'KOLAM_CREATED',
  'KOLAM_UPDATED',
  'KOLAM_PUBLISHED',
  'KOLAM_UNPUBLISHED',
  'KOLAM_DELETED',
  'KOLAM_OWNER_LINKED',
  'KOLAM_OWNER_UNLINKED',
  'SHOP_CREATED',
  'SHOP_UPDATED',
  'SHOP_OWNER_LINKED',
  'SHOP_OWNER_UNLINKED',
  'SHOP_DEACTIVATED',
  // Written by require-kolam-owner/require-shop-owner when the guard admits someone
  // on their ADMIN role rather than on ownership. Records ACCESS, not a committed
  // change — the guard runs before the handler, so it cannot share the mutation's
  // transaction. See the spec's "Content editing" section.
  'ADMIN_ACTED_AS_OWNER',
  // Slice — tournament moderation and promotion.
  'TOURNAMENT_APPROVE',
  'TOURNAMENT_REJECT',
  'TOURNAMENT_TAKEDOWN',
  'TOURNAMENT_SET_PROMOTION',
  // Slice — catch verification. Written by the admin queue when staff decide a catch.
  // Distinct from ADMIN_ACTED_AS_OWNER, which records that a guard admitted someone on
  // their role; these two record the decision itself, inside its transaction.
  'CATCH_VERIFIED',
  'CATCH_REJECTED',
  // Slice — the public site's blog, written and published from the admin dashboard.
  'BLOG_POST_CREATED',
  'BLOG_POST_UPDATED',
  'BLOG_POST_PUBLISHED',
  'BLOG_POST_UNPUBLISHED',
  'BLOG_POST_DELETED',
  // Slice — moderation. Staff removing an angler's post, and suspending or restoring
  // an account. `before` on CATCH_DELETED keeps enough of the post to know what was
  // removed, since the row itself is gone.
  'CATCH_DELETED',
  'USER_SUSPENDED',
  'USER_UNSUSPENDED',
  // Slice — community spot review. Staff approving, rejecting, publishing and
  // unpublishing spots that anglers submitted.
  'SPOT_APPROVED',
  'SPOT_REJECTED',
  'SPOT_PUBLISHED',
  'SPOT_UNPUBLISHED',
])
export type AdminAction = z.infer<typeof AdminAction>

export const AdminAssignableRole = z.enum(['ANGLER', 'KOLAM_OWNER', 'SHOP_OWNER', 'ADMIN'])
export type AdminAssignableRole = z.infer<typeof AdminAssignableRole>

// PATCH /api/admin/users/:id/role
// `reason` is required: it is the field the audit log exists to carry.
export const AdminRoleUpdateRequest = z.object({
  role: AdminAssignableRole,
  reason: z.string().trim().min(1),
})
export type AdminRoleUpdateRequest = z.infer<typeof AdminRoleUpdateRequest>

// GET /api/admin/users
export const AdminUserListItem = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  role: AdminAssignableRole,
  image: z.string().nullable(),
  createdAt: z.string(), // ISO datetime
  // Set while the account is suspended: it cannot sign in and every token it holds
  // is rejected. Null for an account in good standing.
  suspendedAt: z.string().nullable(), // ISO datetime
})
export type AdminUserListItem = z.infer<typeof AdminUserListItem>

export const AdminUserListResponse = z.object({
  items: z.array(AdminUserListItem),
  nextCursor: z.string().nullable(),
})
export type AdminUserListResponse = z.infer<typeof AdminUserListResponse>

// GET /api/admin/users/:id
export const AdminUserDetail = AdminUserListItem.extend({
  bio: z.string().nullable(),
  state: z.string().nullable(),
  ownedKolam: z.array(z.object({ id: z.string(), name: z.string() })),
  subscriptions: z.array(
    z.object({
      plan: z.string(),
      status: z.string(),
      currentPeriodEnd: z.string(), // ISO datetime
    }),
  ),
  // Why the account was suspended, as the admin wrote it. Null when not suspended.
  suspendedReason: z.string().nullable(),
  recentCatches: z.array(
    z.object({
      id: z.string(),
      // Enough of the post for staff to recognise it before deleting it.
      title: z.string().nullable(),
      photoUrl: z.string().nullable(),
      published: z.boolean(),
      speciesName: z.string().nullable(),
      caughtAt: z.string(), // ISO datetime
      status: CatchStatus,
    }),
  ),
})
export type AdminUserDetail = z.infer<typeof AdminUserDetail>

// PATCH /api/admin/users/:id/suspension
// `suspended: true` suspends, `false` lifts it. The reason is required both ways: it
// is what the audit log exists to carry.
export const AdminSuspensionRequest = z.object({
  suspended: z.boolean(),
  reason: z.string().trim().min(1),
})
export type AdminSuspensionRequest = z.infer<typeof AdminSuspensionRequest>

// DELETE /api/admin/catches/:id takes AdminDeleteRequest (a reason only), defined
// further down with the other delete bodies.

// GET /api/admin/audit-log
export const AdminAuditLogEntry = z.object({
  id: z.string(),
  actorId: z.string(),
  actorEmail: z.string().nullable(),
  // Deliberately a plain string, not AdminAction: this log is append-only and its
  // rows outlive the vocabulary that wrote them. A strict enum here would make rows
  // written by an older action set unparseable. The enum is enforced on the write
  // side instead (see the audit helper's AuditEntry).
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  reason: z.string().nullable(),
  createdAt: z.string(), // ISO datetime
})
export type AdminAuditLogEntry = z.infer<typeof AdminAuditLogEntry>

export const AdminAuditLogResponse = z.object({
  items: z.array(AdminAuditLogEntry),
  nextCursor: z.string().nullable(),
})
export type AdminAuditLogResponse = z.infer<typeof AdminAuditLogResponse>

// --- Slice B: listings and ownership -----------------------------------------

const Reason = z.string().trim().min(1)

// Malaysia sits well inside these bounds; the wide range is a typo guard, not a
// geofence — a transposed digit puts a pond in the sea, and the map has no undo.
const Latitude = z.number().min(-90).max(90)
const Longitude = z.number().min(-180).max(180)

// PATCH /api/admin/kolam/:id/owner and /api/admin/shops/:id/owner
// `userId: null` means unlink. For kolam that also re-resolves stranded catches.
export const AdminOwnerLinkRequest = z.object({
  userId: z.string().min(1).nullable(),
  reason: Reason,
})
export type AdminOwnerLinkRequest = z.infer<typeof AdminOwnerLinkRequest>

// PATCH /api/admin/kolam/:id/publish
export const AdminPublishRequest = z.object({
  isPublished: z.boolean(),
  reason: Reason,
})
export type AdminPublishRequest = z.infer<typeof AdminPublishRequest>

// --- Community spot review ---------------------------------------------------

// The types a pending spot can be approved into. KOLAM is absent on purpose: a kolam
// is created through the kolam flow, never by approving a community spot.
export const OpenWaterSpotType = z.enum(['SUNGAI', 'TASIK', 'EMPANGAN', 'LAUT'])
export type OpenWaterSpotType = z.infer<typeof OpenWaterSpotType>

// POST /api/admin/spots/:id/approve
// `type` is optional: staff may correct the type the contributor picked.
export const AdminSpotApproveRequest = z.object({
  type: OpenWaterSpotType.optional(),
})
export type AdminSpotApproveRequest = z.infer<typeof AdminSpotApproveRequest>

// POST /api/admin/spots/:id/reject
export const AdminSpotRejectRequest = z.object({ reason: Reason })
export type AdminSpotRejectRequest = z.infer<typeof AdminSpotRejectRequest>

// One row in the review queue: a spot an angler submitted that is not yet approved.
export const AdminPendingSpot = z.object({
  id: z.string(),
  name: z.string(),
  type: SpotType,
  state: z.string().nullable(),
  address: z.string().nullable(),
  description: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  sentAt: z.string(), // ISO datetime
  contributor: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      image: z.string().nullable(),
    })
    .nullable(),
  catchPhotos: z.array(z.string()),
  catchCount: z.number().int(),
})
export type AdminPendingSpot = z.infer<typeof AdminPendingSpot>

// One row in the catalogue: an approved spot, published or not.
export const AdminCatalogueSpot = z.object({
  id: z.string(),
  name: z.string(),
  type: SpotType,
  state: z.string().nullable(),
  isPublished: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
})
export type AdminCatalogueSpot = z.infer<typeof AdminCatalogueSpot>

// GET /api/admin/spots/pending — `pendingCount` is the queue's total, not this page's length.
export const AdminPendingSpotsResponse = z.object({
  spots: z.array(AdminPendingSpot),
  nextCursor: z.string().nullable(),
  pendingCount: z.number().int(),
})
export type AdminPendingSpotsResponse = z.infer<typeof AdminPendingSpotsResponse>

// GET /api/admin/spots/catalogue
export const AdminCatalogueSpotsResponse = z.object({
  spots: z.array(AdminCatalogueSpot),
  nextCursor: z.string().nullable(),
  pendingCount: z.number().int(),
})
export type AdminCatalogueSpotsResponse = z.infer<typeof AdminCatalogueSpotsResponse>

// POST /api/admin/kolam — writes Spot and Kolam together; see the spec.
export const AdminKolamCreateRequest = z.object({
  name: z.string().trim().min(1),
  latitude: Latitude,
  longitude: Longitude,
  state: z.string().trim().min(1).nullable().optional(),
  address: z.string().trim().min(1).nullable().optional(),
  phone: z.string().trim().min(1).nullable().optional(),
  whatsapp: z.string().trim().min(1).nullable().optional(),
  category: z.string().trim().min(1).nullable().optional(),
  website: z.string().url().nullable().optional(),
  googleMapsUrl: z.string().url().nullable().optional(),
  reason: Reason,
})
export type AdminKolamCreateRequest = z.infer<typeof AdminKolamCreateRequest>

// PATCH /api/admin/kolam/:id — every field optional; absent means "leave alone".
export const AdminKolamUpdateRequest = AdminKolamCreateRequest.partial().extend({ reason: Reason })
export type AdminKolamUpdateRequest = z.infer<typeof AdminKolamUpdateRequest>

export const AdminKolamListItem = z.object({
  id: z.string(),
  spotId: z.string(),
  name: z.string(),
  state: z.string().nullable(),
  isPublished: z.boolean(),
  ownerId: z.string().nullable(),
  ownerName: z.string().nullable(),
  pricingCount: z.number().int(),
  photoCount: z.number().int(),
  hoursCount: z.number().int(),
  createdAt: z.string(), // ISO datetime
})
export type AdminKolamListItem = z.infer<typeof AdminKolamListItem>

export const AdminKolamListResponse = z.object({
  items: z.array(AdminKolamListItem),
  nextCursor: z.string().nullable(),
})
export type AdminKolamListResponse = z.infer<typeof AdminKolamListResponse>

export const AdminKolamDetail = AdminKolamListItem.extend({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  category: z.string().nullable(),
  website: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
  ownerEmail: z.string().nullable(),
  catchCount: z.number().int(),
  reviewCount: z.number().int(),
  pendingCatchCount: z.number().int(),
  // Precomputed so the UI states the delete rule instead of re-deriving it.
  canDelete: z.boolean(),
  deleteBlockedReason: z.string().nullable(),
})
export type AdminKolamDetail = z.infer<typeof AdminKolamDetail>

// GET /api/admin/summary — the triage landing page.
export const AdminSummary = z.object({
  kolamTotal: z.number().int(),
  kolamMissingPricing: z.number().int(),
  kolamMissingOwner: z.number().int(),
  kolamMissingHours: z.number().int(),
  kolamMissingPhotos: z.number().int(),
  kolamUnpublished: z.number().int(),
  shopTotal: z.number().int(),
  shopMissingOwner: z.number().int(),
  // How many catches are waiting on a staff decision. Near-zero while
  // AUTO_VERIFY_UNOWNED_KOLAM is true — only owner-registered kolam queue up.
  pendingCatches: z.number().int(),
})
export type AdminSummary = z.infer<typeof AdminSummary>

// GET /api/admin/places/resolve?url=… — a lookup, never a write.
export const AdminPlacesResolveResponse = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().nullable(),
  address: z.string().nullable(),
})
export type AdminPlacesResolveResponse = z.infer<typeof AdminPlacesResolveResponse>

// DELETE bodies carry only the reason. A separate schema rather than reusing the
// update one, so a stray `name` in a delete request is a 400 rather than ignored.
export const AdminDeleteRequest = z.object({ reason: Reason })
export type AdminDeleteRequest = z.infer<typeof AdminDeleteRequest>

// --- Shops -------------------------------------------------------------------

export const AdminShopCreateRequest = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  latitude: Latitude,
  longitude: Longitude,
  hours: z.string().trim().min(1),
  phone: z.string().trim().min(1).nullable().optional(),
  category: z.string().trim().min(1).nullable().optional(),
  website: z.string().url().nullable().optional(),
  googleMapsUrl: z.string().url().nullable().optional(),
  reason: Reason,
})
export type AdminShopCreateRequest = z.infer<typeof AdminShopCreateRequest>

export const AdminShopUpdateRequest = AdminShopCreateRequest.partial().extend({
  isActive: z.boolean().optional(),
  reason: Reason,
})
export type AdminShopUpdateRequest = z.infer<typeof AdminShopUpdateRequest>

export const AdminShopListItem = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  isActive: z.boolean(),
  ownerId: z.string().nullable(),
  ownerName: z.string().nullable(),
  itemCount: z.number().int(),
  createdAt: z.string(), // ISO datetime
})
export type AdminShopListItem = z.infer<typeof AdminShopListItem>

export const AdminShopListResponse = z.object({
  items: z.array(AdminShopListItem),
  nextCursor: z.string().nullable(),
})
export type AdminShopListResponse = z.infer<typeof AdminShopListResponse>

export const AdminShopDetail = AdminShopListItem.extend({
  latitude: z.number(),
  longitude: z.number(),
  hours: z.string(),
  phone: z.string().nullable(),
  category: z.string().nullable(),
  website: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
  ownerEmail: z.string().nullable(),
})
export type AdminShopDetail = z.infer<typeof AdminShopDetail>

// GET /api/admin/map — every kolam and shop that can be put on a map, in one payload.
//
// Deliberately not the public MapPinsResponse: that one filters to
// `spot.isPublished` and carries no shops, because it answers "what can an angler
// see". This one answers "where is everything staff own", so drafts are included and
// flagged, and the gap counts ride along so the map can filter on the same criteria
// the Overview cards use without a second round trip.
//
// No cursor. Demo scale (~130 kolam, a handful of shops) — same reasoning as the
// unpaginated /api/map. A viewport bounding box is the change to make if that stops
// being true, not a cursor, because a map cannot render half a page.
export const AdminMapKolamPin = z.object({
  id: z.string(),
  spotId: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  state: z.string().nullable(),
  isPublished: z.boolean(),
  ownerId: z.string().nullable(),
  ownerName: z.string().nullable(),
  pricingCount: z.number().int(),
  photoCount: z.number().int(),
  hoursCount: z.number().int(),
})
export type AdminMapKolamPin = z.infer<typeof AdminMapKolamPin>

export const AdminMapShopPin = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  isActive: z.boolean(),
  ownerId: z.string().nullable(),
  ownerName: z.string().nullable(),
  itemCount: z.number().int(),
})
export type AdminMapShopPin = z.infer<typeof AdminMapShopPin>

// `*WithoutCoordinates` are counts, not lists: a row with no usable latitude/longitude
// cannot be drawn, and dropping it silently would leave the map quietly disagreeing
// with the Listings count. The map states the shortfall instead.
export const AdminMapResponse = z.object({
  kolam: z.array(AdminMapKolamPin),
  shops: z.array(AdminMapShopPin),
  kolamWithoutCoordinates: z.number().int(),
  shopsWithoutCoordinates: z.number().int(),
})
export type AdminMapResponse = z.infer<typeof AdminMapResponse>

// GET /api/admin/catches — the cross-kolam verification queue.
//
// PendingCatchItem (kolam.ts) is the owner's view of the same row. An owner already
// knows which pond they run; staff are looking at every pond at once, so the kolam's
// identity has to travel with each row. Declared separately rather than extending that
// schema: the two projections answer to different endpoints and should be free to drift.
export const AdminPendingCatchItem = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  title: z.string().nullable(),
  speciesName: z.string().nullable(),
  // The only evidence staff have for a catch they did not weigh — same reasoning as
  // PendingCatchItem's own note.
  photoUrls: z.array(z.string()),
  weightGrams: z.number().int().nullable(),
  lengthMm: z.number().int().nullable(),
  caughtAt: z.string(), // ISO datetime
  kolamId: z.string(),
  kolamName: z.string(),
})
export type AdminPendingCatchItem = z.infer<typeof AdminPendingCatchItem>

export const AdminPendingCatchesResponse = z.object({
  catches: z.array(AdminPendingCatchItem),
  nextCursor: z.string().nullable(),
})
export type AdminPendingCatchesResponse = z.infer<typeof AdminPendingCatchesResponse>
