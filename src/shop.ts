import { z } from 'zod'
import { SenAmount } from './common'

// Physical tackle shop directory. See schema.prisma's Shop/ShopItem comments
// and decision-log.md #35: display-only, no purchase flow — buying happens by
// contacting the shop directly (call or WhatsApp).

export const ShopItemCategory = z.enum(['ROD', 'CASTING_REEL', 'SPINNING_REEL', 'WEIGHT', 'LINE', 'HOOK', 'OTHER'])
export type ShopItemCategory = z.infer<typeof ShopItemCategory>

// GET /api/shop — grid cards
export const ShopListItem = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  rating: z.number().nullable(),
  lat: z.number(),
  lng: z.number(),
  category: z.string().nullable(),
})
export type ShopListItem = z.infer<typeof ShopListItem>

export const ShopListResponse = z.object({
  shops: z.array(ShopListItem),
})
export type ShopListResponse = z.infer<typeof ShopListResponse>

// GET /api/shop/:id — detail page
export const ShopItem = z.object({
  id: z.string(),
  name: z.string(),
  category: ShopItemCategory,
  priceSen: SenAmount.nullable(),
  imageUrl: z.string().nullable(),
})
export type ShopItem = z.infer<typeof ShopItem>

export const ShopDetail = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  phone: z.string().nullable(),
  hours: z.string(),
  rating: z.number().nullable(),
  imageUrl: z.string().nullable(),
  category: z.string().nullable(),
  website: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
  items: z.array(ShopItem),
})
export type ShopDetail = z.infer<typeof ShopDetail>

// ---------------------------------------------------------------------------
// Shop-owner dashboard (jom-mancing-admin). Mirrors the Kolam-owner section
// above — profile fields stay owner-editable, name/address/lat/lng stay
// staff-only, same rationale as UpdateKolamProfileRequest.

// GET /api/shop/mine
export const ShopMineItem = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  imageUrl: z.string().nullable(),
  rating: z.number().nullable(),
})
export type ShopMineItem = z.infer<typeof ShopMineItem>

export const ShopMineListResponse = z.object({
  shops: z.array(ShopMineItem),
})
export type ShopMineListResponse = z.infer<typeof ShopMineListResponse>

// PATCH /api/shop/:id
export const UpdateShopProfileRequest = z.object({
  phone: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  googleMapsUrl: z.string().nullable().optional(),
  hours: z.string().optional(),
})
export type UpdateShopProfileRequest = z.infer<typeof UpdateShopProfileRequest>

// POST /api/shop/:id/items
export const CreateShopItemRequest = z.object({
  name: z.string().min(1),
  category: ShopItemCategory,
  priceSen: SenAmount.nullable().optional(),
  imageUrl: z.string().nullable().optional(),
})
export type CreateShopItemRequest = z.infer<typeof CreateShopItemRequest>

// GET /api/shop/:id/items — distinct from ShopItem (public ShopDetail response, no
// id) for the same reason as KolamPhotoManageItem: the owner dashboard needs an id
// to target a specific item for deletion.
export const ShopItemManageItem = z.object({
  id: z.string(),
  name: z.string(),
  category: ShopItemCategory,
  priceSen: SenAmount.nullable(),
  imageUrl: z.string().nullable(),
})
export type ShopItemManageItem = z.infer<typeof ShopItemManageItem>

export const ShopItemsResponse = z.object({
  items: z.array(ShopItemManageItem),
})
export type ShopItemsResponse = z.infer<typeof ShopItemsResponse>
