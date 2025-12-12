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
 * API Product Schema (Backend DTO)
 * Represents the raw data coming from the API (strings for decimals, etc.)
 */
export const ApiProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  concept: z.string().optional().nullable(),
  originalCharacter: z.string().optional().nullable(),
  description: z.string(),
  shortDescription: z.string().optional().nullable(),
  // Backend returns Postgres DECIMAL as string
  price: z.string(),
  originalPrice: z.string().optional().nullable(),
  depositAmount: z.string().optional().nullable(),
  preOrder: z.boolean(),
  inStock: z.boolean(),
  stockCount: z.number().int().nonnegative(),
  images: z.array(z.string()),
  videoPlaybackId: z.string().optional().nullable(),
  videoProvider: z.enum(['cloudflare', 'youtube']).optional().nullable(),
  videoThumbnail: z.string().optional().nullable(),
  // Backend can return colors as string array (legacy) or ProductColor objects (new)
  colors: z.union([
    z.array(ProductColorSchema),
    z.array(z.string())
  ]).optional().default([]),
  ageRange: z.string().optional().nullable(),
  features: z.array(z.string()).default([]),
  category: z.string(),
  badge: z.string().optional().nullable(),
  active: z.boolean(),
  viewCount: z.number().int().nonnegative(),
  orderCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ApiProduct = z.infer<typeof ApiProductSchema>;

/**
 * Domain Product Model (UI Optimized)
 * This is the main 'Product' type used throughout the frontend application.
 * It has proper number types for prices and normalized color objects.
 */
export interface Product extends Omit<ApiProduct, 'price' | 'originalPrice' | 'depositAmount' | 'colors'> {
  price: number;
  originalPrice?: number;
  depositAmount?: number;
  colors: ProductColor[];
}

/**
 * API Products Array Schema
 */
export const ApiProductsArraySchema = z.array(ApiProductSchema);

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
