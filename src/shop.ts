import { z } from 'zod'
import { SenAmount } from './common'

// GET /api/shop — affiliate products. See schema.prisma's Product model comment:
// deliberately not order-bearing, outboundUrl is the whole business logic.
export const ShopProductItem = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  priceSen: SenAmount.nullable(),
  merchant: z.string(),
  outboundUrl: z.string(),
  category: z.string().nullable(),
})
export type ShopProductItem = z.infer<typeof ShopProductItem>

export const ShopListResponse = z.object({
  products: z.array(ShopProductItem),
})
export type ShopListResponse = z.infer<typeof ShopListResponse>
