// Listing Validation Schemas
import { z } from 'zod';

export const createListingSchema = z.object({
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be less than 2000 characters'),
    categoryId: z
        .string()
        .optional(),  // Optional because we create category dynamically if new
    listingType: z.enum(['FIXED', 'QUOTE']),
    price: z
        .preprocess(
            (val) => {
                // Convert NaN or undefined to undefined for proper optional handling
                if (val === undefined || val === null || Number.isNaN(val)) {
                    return undefined;
                }
                return val;
            },
            z.number().positive('Price must be greater than 0').optional()
        ),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']),
}).refine((data) => {
    // For FIXED listings, price is required and must be positive
    if (data.listingType === 'FIXED') {
        return data.price !== undefined && data.price > 0;
    }
    // For QUOTE listings, price should be undefined or not provided
    return true;
}, {
    message: 'Price is required for fixed-price listings',
    path: ['price'],
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
