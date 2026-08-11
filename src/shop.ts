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
  items: z.array(ShopItem),
})
export type ShopDetail = z.infer<typeof ShopDetail>
