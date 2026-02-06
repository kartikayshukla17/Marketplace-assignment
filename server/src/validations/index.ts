// Zod Validation Schemas
// Following industry-standard validation patterns

import { z } from 'zod';

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['USER', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// ==========================================
// LISTING SCHEMAS
// ==========================================

// Base listing schema without refinement (for partial updates)
const baseListingSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    categoryId: z.string().min(1, 'Category is required'),
    listingType: z.enum(['FIXED', 'QUOTE']).optional().default('FIXED'),
    price: z
        .preprocess(
            (val) => {
                // Convert null/undefined to undefined for proper optional handling
                if (val === undefined || val === null || Number.isNaN(val)) {
                    return undefined;
                }
                return val;
            },
            z.number().positive('Price must be positive').optional()
        ),
    currency: z.string().default('USD'),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).default('DRAFT'),
    images: z.array(z.string().url()).optional(),
});

// Create listing schema with validation refinement
export const createListingSchema = baseListingSchema.refine((data) => {
    // For FIXED listings, price is required
    if (data.listingType === 'FIXED') {
        return data.price !== undefined && data.price > 0;
    }
    // For QUOTE listings, price should not be provided
    return true;
}, {
    message: 'Price is required for fixed-price listings',
    path: ['price'],
});

// Update schema can use partial on base schema
export const updateListingSchema = baseListingSchema.partial();

// ==========================================
// ORDER SCHEMAS
// ==========================================

export const createOrderSchema = z.object({
    listingId: z.string().min(1, 'Listing ID is required'),
    message: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
});

// ==========================================
// TYPE EXPORTS (Inferred from Zod)
// ==========================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
