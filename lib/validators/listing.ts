import { z } from 'zod';

export const MapArtDetailsSchema = z.object({
  mapSize: z.enum(['1×1', '2×2', '3×3', '4×4', 'Custom']),
  copiesInStock: z.number().int().min(0).default(1),
  turnaroundDays: z.number().int().min(1).max(60).optional(),
  openSlots: z.number().int().min(0).max(20).optional(),
  tags: z.array(z.string()).default([]),
});

export const MarketDetailsSchema = z.object({
  category: z.enum(['Spawners', 'Gear', 'Resources', 'Misc']),
  quantity: z.number().int().min(1),
  unitPrice: z.bigint().or(z.number()).optional(),
  isBundleOnly: z.boolean().default(false),
});

export const BuildDetailsSchema = z.object({
  buildTypes: z.array(z.enum(['Base', 'Farm', 'Redstone', 'Decorative', 'PvP Arena', 'Perimeter'])).default(['Base']),
  turnaroundDays: z.number().int().min(1).max(90).optional(),
  deadline: z.string().optional(),
  budgetMax: z.bigint().or(z.number()).optional(),
  coordinates: z.string().max(100).optional(),
});

export const CreateListingSchema = z.object({
  section: z.enum(['MAP_ART', 'MARKET', 'BUILD']),
  kind: z.enum(['ARTWORK', 'COMMISSION_OFFER', 'SELL', 'BUY', 'SERVICE', 'REQUEST']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description exceeds 5,000 character limit'),
  price: z.bigint().or(z.number()).nullable().optional(),
  isNegotiable: z.boolean().default(false),
  images: z.array(z.string()).max(10, 'Maximum 10 images allowed').default([]),
  details: z.record(z.string(), z.any()),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type MapArtDetails = z.infer<typeof MapArtDetailsSchema>;
export type MarketDetails = z.infer<typeof MarketDetailsSchema>;
export type BuildDetails = z.infer<typeof BuildDetailsSchema>;
