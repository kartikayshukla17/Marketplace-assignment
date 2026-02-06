// Admin Service - Business logic for admin operations

import { prisma } from '../lib/prisma.js';

// ==========================================
// ADMIN QUERIES
// ==========================================

// Get all users with pagination and search
export const getAllUsers = async (page = 1, limit = 20, search?: string) => {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBlocked: true,
                createdAt: true,
                _count: {
                    select: {
                        listings: true,
                        ordersAsBuyer: true,
                        ordersAsSeller: true,
                    },
                },
            },
            where: search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            } : undefined,
        }),
        prisma.user.count({
            where: search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            } : undefined,
        }),
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// Get all orders with pagination and search
export const getAllOrders = async (page = 1, limit = 20, search?: string) => {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                buyer: {
                    select: { id: true, name: true, email: true },
                },
                seller: {
                    select: { id: true, name: true, email: true },
                },
                listing: {
                    select: { id: true, title: true, listingType: true },
                },
            },
            where: search ? {
                OR: [
                    { buyer: { name: { contains: search, mode: 'insensitive' } } },
                    { seller: { name: { contains: search, mode: 'insensitive' } } },
                    { listing: { title: { contains: search, mode: 'insensitive' } } },
                ]
            } : undefined,
        }),
        prisma.order.count({
            where: search ? {
                OR: [
                    { buyer: { name: { contains: search, mode: 'insensitive' } } },
                    { seller: { name: { contains: search, mode: 'insensitive' } } },
                    { listing: { title: { contains: search, mode: 'insensitive' } } },
                ]
            } : undefined,
        }),
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// Get all listings with pagination and search
export const getAllListings = async (page = 1, limit = 20, search?: string) => {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
        prisma.listing.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: { id: true, name: true, email: true, isBlocked: true },
                },
                category: {
                    select: { id: true, name: true },
                },
            },
            where: search ? {
                title: { contains: search, mode: 'insensitive' }
            } : undefined,
        }),
        prisma.listing.count({
            where: search ? {
                title: { contains: search, mode: 'insensitive' }
            } : undefined,
        }),
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

// Toggle user block status
export const toggleUserBlock = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Toggle the status
    if (user.role === 'ADMIN') {
        throw new Error('Cannot block an admin');
    }

    return prisma.user.update({
        where: { id: userId },
        data: { isBlocked: !user.isBlocked },
        select: { id: true, name: true, email: true, role: true, isBlocked: true }
    });
};

// Toggle listing block status
export const toggleListingBlock = async (listingId: string) => {
    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
    });

    if (!listing) {
        throw new Error('Listing not found');
    }

    return prisma.listing.update({
        where: { id: listingId },
        data: { isBlocked: !listing.isBlocked },
        select: {
            id: true,
            title: true,
            status: true,
            isBlocked: true,
            seller: {
                select: { id: true, name: true }
            }
        }
    });
};
