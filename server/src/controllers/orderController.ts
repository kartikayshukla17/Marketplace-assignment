// Order Controller
// Handles HTTP requests for Orders

import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/index.js';
import * as orderService from '../services/orderService.js';
import { OrderStatus } from '../../generated/prisma/client.js';

// GET /api/orders/buyer (Protected - Orders I sent as buyer)
export const getMyBuyerOrders = catchAsync(async (req: Request, res: Response) => {
    const orders = await orderService.findBuyerOrders(req.user!.id);

    res.status(200).json({
        status: 'success',
        data: { orders },
    });
});

// GET /api/orders/seller (Protected - Orders I received as seller)
export const getMySellerOrders = catchAsync(async (req: Request, res: Response) => {
    const orders = await orderService.findSellerOrders(req.user!.id);

    res.status(200).json({
        status: 'success',
        data: { orders },
    });
});

// GET /api/orders/:id (Protected - View single order)
export const getOrderById = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const id = req.params.id as string;
    const order = await orderService.findOrderById(id, req.user!.id, isAdmin);

    if (!order) {
        throw new AppError('Order not found or you do not have permission', 404);
    }

    res.status(200).json({
        status: 'success',
        data: { order },
    });
});

// POST /api/orders (Protected - Create purchase request)
export const createOrder = catchAsync(async (req: Request, res: Response) => {
    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
    }

    const result = await orderService.createOrder({
        listingId: validation.data.listingId,
        buyerId: req.user!.id,
        message: validation.data.message,
    });

    if (result.error) {
        throw new AppError(result.error, 400);
    }

    res.status(201).json({
        status: 'success',
        data: { order: result.order },
    });
});

// PATCH /api/orders/:id/status (Protected - Seller: Accept/Reject/Complete)
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const validation = updateOrderStatusSchema.safeParse(req.body);
    if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
    }

    const isAdmin = req.user!.role === 'ADMIN';
    const id = req.params.id as string;
    const result = await orderService.updateOrderStatus(
        id,
        req.user!.id,
        validation.data.status as OrderStatus,
        isAdmin
    );

    if (result.error) {
        throw new AppError(result.error, 400);
    }

    res.status(200).json({
        status: 'success',
        data: { order: result.order },
    });
});

// PATCH /api/orders/:id/cancel (Protected - Buyer: Cancel before acceptance)
export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id as string;
    const result = await orderService.cancelOrder(orderId, req.user!.id);

    if (result.error) {
        throw new AppError(result.error, 400);
    }

    res.status(200).json({
        status: 'success',
        data: { order: result.order },
    });
});

// PATCH /api/orders/:id/quote (Protected - Seller: Provide quote for QUOTE listing)
export const provideQuote = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id as string;
    const { offerPrice } = req.body;

    if (!offerPrice || typeof offerPrice !== 'number') {
        throw new AppError('Valid quote price is required', 400);
    }

    const result = await orderService.provideQuote(orderId, req.user!.id, offerPrice);

    if (result.error) {
        throw new AppError(result.error, 400);
    }

    res.status(200).json({
        status: 'success',
        data: { order: result.order },
    });
});
