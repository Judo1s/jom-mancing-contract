import { z } from 'zod'
import { CatchStatus } from './catch-log'

// Internal admin surface. See jom-mancing-admin's
// docs/superpowers/specs/2026-09-01-internal-admin-foundation-design.md.

// The audit log's action vocabulary. A plain String column in Postgres, an enum here —
// slices B, C and D extend this list without a database migration, while every call
// site stays type-checked.
export const AdminAction = z.enum(['USER_ROLE_CHANGED'])
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
  recentCatches: z.array(
    z.object({
      id: z.string(),
      speciesName: z.string().nullable(),
      caughtAt: z.string(), // ISO datetime
      status: CatchStatus,
    }),
  ),
})
export type AdminUserDetail = z.infer<typeof AdminUserDetail>

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
