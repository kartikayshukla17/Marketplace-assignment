// Admin Controller - Handle admin-only requests

import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import * as adminService from '../services/adminService.js';

// GET /api/admin/users - Get all users (paginated)
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;

    const result = await adminService.getAllUsers(page, limit, search);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// GET /api/admin/orders - Get all orders (paginated)
export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;

    const result = await adminService.getAllOrders(page, limit, search);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// GET /api/admin/listings - Get all listings (paginated)
export const getAllListings = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;

    const result = await adminService.getAllListings(page, limit, search);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// PATCH /api/admin/users/:id/block - Block/Unblock user
export const toggleUserBlock = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await adminService.toggleUserBlock(id as string);

    res.status(200).json({
        success: true,
        message: `User has been ${result.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: result,
    });
});

// PATCH /api/admin/listings/:id/block - Block/Unblock listing
export const toggleListingBlock = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await adminService.toggleListingBlock(id as string);

    res.status(200).json({
        success: true,
        message: `Listing has been ${result.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: result,
    });
});
