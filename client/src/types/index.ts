// Type definitions for API responses and data models

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

export type ListingType = 'FIXED' | 'QUOTE';

export interface Listing {
    id: string;
    title: string;
    description: string;
    categoryId?: string;
    category?: {
        id: string;
        name: string;
    };
    listingType: ListingType;  // FIXED or QUOTE
    price?: number;             // Optional for QUOTE listings
    currency: string;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
    isBlocked: boolean;
    images: string[];
    sellerId: string;
    seller?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Order {
    id: string;
    status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    offerPrice?: number;  // Null until seller provides quote for QUOTE listings
    message?: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    listing?: {
        id: string;
        title: string;
        images: string[];
        listingType: ListingType;
    };
    buyer?: {
        id: string;
        name: string;
        email: string;
    };
    seller?: {
        id: string;
        name: string;
    };
    createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    listings: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
