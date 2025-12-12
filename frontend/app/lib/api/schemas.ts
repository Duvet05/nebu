/**
 * Zod schemas for API response validation
 * Ensures type safety and runtime validation of backend responses
 */

import { z } from 'zod';

/**
 * Product Color Schema
 */
export const ProductColorSchema = z.object({
  id: z.string(),
  name: z.string(),
  hex: z.string(),
  gradient: z.string(),
});

export type ProductColor = z.infer<typeof ProductColorSchema>;

/**
 * Product Schema
 */
export const ProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  concept: z.string().optional(),
  originalCharacter: z.string().optional(),
  description: z.string(),
  shortDescription: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  depositAmount: z.number().nonnegative().optional(),
  preOrder: z.boolean(),
  inStock: z.boolean(),
  stockCount: z.number().int().nonnegative(),
  images: z.array(z.string()),
  videoPlaybackId: z.string().optional(),
  videoProvider: z.enum(['cloudflare', 'youtube']).optional(),
  videoThumbnail: z.string().optional(),
  colors: z.array(ProductColorSchema).optional(),
  ageRange: z.string().optional(),
  features: z.array(z.string()),
  category: z.string(),
  badge: z.string().optional(),
  active: z.boolean(),
  viewCount: z.number().int().nonnegative(),
  orderCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Products Array Schema
 */
export const ProductsArraySchema = z.array(ProductSchema);

/**
 * Inventory Schema
 */
export const InventorySchema = z.object({
  productId: z.string().uuid(),
  availableUnits: z.number().int().nonnegative(),
  totalUnits: z.number().int().nonnegative(),
  isAvailable: z.boolean(),
});

export type Inventory = z.infer<typeof InventorySchema>;

/**
 * Order Schema
 */
export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string().optional(),
  total: z.number().nonnegative(),
  status: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

/**
 * Lead Schema
 */
export const LeadSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  source: z.string(),
  status: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Lead = z.infer<typeof LeadSchema>;

/**
 * Generic API Success Response
 */
export const ApiSuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type ApiSuccessResponse = z.infer<typeof ApiSuccessResponseSchema>;

/**
 * Generic API Error Response
 */
export const ApiErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
