// Listing Service
// Business logic for Listings, including soft delete handling

import { prisma } from '../lib/prisma.js';
import { ListingStatus, ListingType } from '../types/enums.js';
import { sanitizeText } from '../utils/sanitize.js';

// ==========================================
// HELPER: Always filter out deleted listings
// ==========================================
const activeListingFilter = {
    isDeleted: false,
};

// ==========================================
// PUBLIC QUERIES (Buyers)
// ==========================================

interface SearchParams {
    search?: string;
    page?: number;
    limit?: number;
}

export const findActiveListings = async (params: SearchParams) => {
    const { search, page = 1, limit = 10 } = params;

    const where: any = {
        ...activeListingFilter,
        status: ListingStatus.ACTIVE,
        isBlocked: false,
        seller: {
            isBlocked: false,
        },
    };

    // Search by title (case-insensitive)
    if (search) {
        where.title = {
            contains: search,
            mode: 'insensitive',
        };
    }

    const [listings, total] = await Promise.all([
        prisma.listing.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: { id: true, name: true },
                },
                category: true,
            },
        }),
        prisma.listing.count({ where }),
    ]);

    return {
        listings,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ==========================================
// SELLER QUERIES (My Listings)
// ==========================================

export const findSellerListings = async (sellerId: string) => {
    return prisma.listing.findMany({
        where: {
            sellerId,
            isDeleted: false,
        },
        orderBy: { createdAt: 'desc' },
        include: {
            category: true,
        },
    });
};

export const findListingById = async (id: string) => {
    return prisma.listing.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            seller: {
                select: { id: true, name: true, email: true },
            },
            category: true,
        },
    });
};

// ==========================================
// MUTATIONS
// ==========================================

interface CreateListingData {
    title: string;
    description: string;
    categoryId: string;
    listingType?: ListingType;  // FIXED or QUOTE
    price?: number;             // Optional: required for FIXED, optional for QUOTE
    currency?: string;
    status?: ListingStatus;
    images?: string[];
    sellerId: string;
}

export const createListing = async (data: CreateListingData) => {
    const listingType = data.listingType || ListingType.FIXED;

    // Validation: FIXED listings must have a price
    if (listingType === ListingType.FIXED && (!data.price || data.price <= 0)) {
        throw new Error('Price is required for fixed-price listings');
    }

    // Sanitize user inputs to prevent XSS
    const sanitizedTitle = sanitizeText(data.title);
    const sanitizedDescription = sanitizeText(data.description);

    return prisma.listing.create({
        data: {
            title: sanitizedTitle,
            description: sanitizedDescription,
            categoryId: data.categoryId,
            listingType,
            price: data.price || null,  // Allow null for QUOTE listings
            currency: data.currency || 'USD',
            status: data.status || ListingStatus.DRAFT,
            images: data.images || [],
            sellerId: data.sellerId,
        },
        include: {
            category: true,
        },
    });
};

export const updateListing = async (id: string, sellerId: string, data: Partial<CreateListingData>) => {
    // First verify ownership
    const listing = await prisma.listing.findFirst({
        where: { id, sellerId, isDeleted: false },
    });

    if (!listing) {
        return null;
    }

    // Sanitize user inputs if provided
    const sanitizedData: Partial<CreateListingData> = { ...data };
    if (data.title) {
        sanitizedData.title = sanitizeText(data.title);
    }
    if (data.description) {
        sanitizedData.description = sanitizeText(data.description);
    }

    return prisma.listing.update({
        where: { id },
        data: sanitizedData,
    });
};

// Soft delete
export const deleteListing = async (id: string, sellerId: string) => {
    const listing = await prisma.listing.findFirst({
        where: { id, sellerId, isDeleted: false },
    });

    if (!listing) {
        return null;
    }

    return prisma.listing.update({
        where: { id },
        data: { isDeleted: true },
    });
};
