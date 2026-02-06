// Order Service
// Business logic for Orders with lifecycle management

import { prisma } from '../lib/prisma.js';
import { OrderStatus } from '../types/enums.js';
import { sanitizeText } from '../utils/sanitize.js';

// ==========================================
// QUERIES
// ==========================================

// Get orders for a BUYER (orders they sent)
export const findBuyerOrders = async (buyerId: string) => {
    return prisma.order.findMany({
        where: { buyerId },
        orderBy: { createdAt: 'desc' },
        include: {
            listing: {
                select: { id: true, title: true, images: true, listingType: true },
            },
            seller: {
                select: { id: true, name: true },
            },
        },
    });
};

// Get orders for a SELLER (orders they received)
export const findSellerOrders = async (sellerId: string) => {
    return prisma.order.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        include: {
            listing: {
                select: { id: true, title: true, images: true, listingType: true },
            },
            buyer: {
                select: { id: true, name: true, email: true },
            },
        },
    });
};

// Get single order with permission check
export const findOrderById = async (orderId: string, userId: string, isAdmin: boolean) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            listing: true,
            buyer: { select: { id: true, name: true, email: true } },
            seller: { select: { id: true, name: true, email: true } },
        },
    });

    if (!order) return null;

    // Check permission: Only buyer, seller, or admin can view
    if (!isAdmin && order.buyerId !== userId && order.sellerId !== userId) {
        return null;
    }

    return order;
};

// ==========================================
// MUTATIONS
// ==========================================

interface CreateOrderData {
    listingId: string;
    buyerId: string;
    message?: string;
}

export const createOrder = async (data: CreateOrderData) => {
    // Get listing details
    const listing = await prisma.listing.findFirst({
        where: {
            id: data.listingId,
            isDeleted: false,
            isBlocked: false,
            status: 'ACTIVE',
        },
    });

    if (!listing) {
        return { error: 'Listing not found or not active' };
    }

    // Prevent buying own listing
    if (listing.sellerId === data.buyerId) {
        return { error: 'You cannot purchase your own listing' };
    }

    // Check for existing active order (duplicate prevention)
    const existingOrder = await prisma.order.findFirst({
        where: {
            buyerId: data.buyerId,
            listingId: data.listingId,
            status: { in: [OrderStatus.REQUESTED, OrderStatus.ACCEPTED] },
        },
    });

    if (existingOrder) {
        return { error: 'You already have a pending order for this listing' };
    }

    // Determine offerPrice based on listing type
    // FIXED: Snapshot price immediately
    // QUOTE: Start with null, seller will provide quote later
    const offerPrice = listing.listingType === 'FIXED' ? listing.price : null;

    // Sanitize message input
    const sanitizedMessage = data.message ? sanitizeText(data.message) : undefined;

    // Create order with SNAPSHOT of price (or null for QUOTE) and COPY of sellerId
    const order = await prisma.order.create({
        data: {
            buyerId: data.buyerId,
            listingId: data.listingId,
            sellerId: listing.sellerId, // DENORMALIZED for fast queries
            offerPrice,                  // SNAPSHOT - price locked (or null for QUOTE)
            message: sanitizedMessage,
            status: OrderStatus.REQUESTED,
        },
    });

    return { order };
};

// Valid status transitions (seller actions)
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.REQUESTED]: [OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
    [OrderStatus.ACCEPTED]: [OrderStatus.COMPLETED],
    [OrderStatus.REJECTED]: [],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
};

// Update order status (Buyer or Seller actions)
export const updateOrderStatus = async (
    orderId: string,
    userId: string,
    newStatus: OrderStatus,
    isAdmin: boolean
) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            listing: {
                select: { listingType: true }
            }
        }
    });

    if (!order) {
        return { error: 'Order not found' };
    }

    // Determine user role
    const isSeller = order.sellerId === userId;
    const isBuyer = order.buyerId === userId;

    // Permission check: Only buyer, seller, or admin can update
    if (!isAdmin && !isSeller && !isBuyer) {
        return { error: 'You do not have permission to update this order' };
    }

    // Role-based validation for ACCEPTED status
    if (newStatus === OrderStatus.ACCEPTED) {
        const isQuoteListing = order.listing.listingType === 'QUOTE';

        if (isQuoteListing && order.offerPrice) {
            // For QUOTE listings with provided quote: only BUYER can accept
            if (!isBuyer && !isAdmin) {
                return { error: 'Only the buyer can accept a quote' };
            }
        } else {
            // For FIXED listings: only SELLER can accept purchase request
            if (!isSeller && !isAdmin) {
                return { error: 'Only the seller can accept a purchase request' };
            }
        }
    }

    // For REJECTED/COMPLETED: seller must be the one updating (except admin)
    if ((newStatus === OrderStatus.REJECTED || newStatus === OrderStatus.COMPLETED) && !isAdmin) {
        if (!isSeller) {
            return { error: 'Only the seller can reject or complete orders' };
        }
    }

    // For CANCELLED: buyer must be the one updating (except admin)
    if (newStatus === OrderStatus.CANCELLED && !isAdmin) {
        if (!isBuyer) {
            return { error: 'Only the buyer can cancel their orders' };
        }
    }

    // Validate status transition
    const allowedTransitions = validTransitions[order.status as OrderStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
        return { error: `Cannot transition from ${order.status} to ${newStatus}` };
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
    });

    return { order: updatedOrder };
};

// Cancel order (Buyer action - only before acceptance)
export const cancelOrder = async (orderId: string, buyerId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return { error: 'Order not found' };
    }

    // Only buyer can cancel their own order
    if (order.buyerId !== buyerId) {
        return { error: 'You can only cancel your own orders' };
    }

    // Can only cancel if still REQUESTED
    if (order.status !== OrderStatus.REQUESTED) {
        return { error: 'You can only cancel orders that are still pending' };
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
    });

    return { order: updatedOrder };
};

// Provide quote (Seller action - only for QUOTE listings with null offerPrice)
export const provideQuote = async (orderId: string, sellerId: string, offerPrice: number) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { listing: true },
    });

    if (!order) {
        return { error: 'Order not found' };
    }

    // Only seller can provide quote
    if (order.sellerId !== sellerId) {
        return { error: 'You can only provide quotes for your own orders' };
    }

    // Can only provide quote if offerPrice is currently null
    if (order.offerPrice !== null) {
        return { error: 'Quote has already been provided for this order' };
    }

    // Must still be in REQUESTED status
    if (order.status !== OrderStatus.REQUESTED) {
        return { error: 'Can only provide quote for pending orders' };
    }

    // Validate price is positive
    if (!offerPrice || offerPrice <= 0) {
        return { error: 'Invalid quote price' };
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { offerPrice },
    });

    return { order: updatedOrder };
};
