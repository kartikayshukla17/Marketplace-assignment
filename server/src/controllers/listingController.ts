// Listing Controller
// Handles HTTP requests for Listings

import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { createListingSchema, updateListingSchema } from '../validations/index.js';
import * as listingService from '../services/listingService.js';
import { ListingType, ListingStatus } from '../types/enums.js';

// GET /api/listings (Public - Active listings only)
export const getListings = catchAsync(async (req: Request, res: Response) => {
    const { search, page, limit } = req.query;

    const result = await listingService.findActiveListings({
        search: typeof search === 'string' ? search : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
    });

    res.status(200).json({
        status: 'success',
        data: result,
    });
});

// GET /api/listings/my (Protected - Seller's own listings)
export const getMyListings = catchAsync(async (req: Request, res: Response) => {
    const listings = await listingService.findSellerListings(req.user!.id);

    res.status(200).json({
        status: 'success',
        data: { listings },
    });
});

// GET /api/listings/:id (Public)
export const getListingById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const listing = await listingService.findListingById(id);

    if (!listing) {
        throw new AppError('Listing not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: { listing },
    });
});

// POST /api/listings (Protected - Create listing)
export const createListing = catchAsync(async (req: Request, res: Response) => {
    const validation = createListingSchema.safeParse(req.body);
    if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
    }

    const listing = await listingService.createListing({
        ...validation.data,
        listingType: validation.data.listingType as ListingType,
        status: validation.data.status as ListingStatus | undefined,
        sellerId: req.user!.id,
    });

    res.status(201).json({
        status: 'success',
        data: { listing },
    });
});

// PUT /api/listings/:id (Protected - Update own listing)
export const updateListing = catchAsync(async (req: Request, res: Response) => {
    const validation = updateListingSchema.safeParse(req.body);
    if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
    }

    const id = req.params.id as string;
    const listing = await listingService.updateListing(
        id,
        req.user!.id,
        {
            ...validation.data,
            listingType: validation.data.listingType as ListingType | undefined,
            status: validation.data.status as ListingStatus | undefined
        }
    );

    if (!listing) {
        throw new AppError('Listing not found or you do not have permission', 404);
    }

    res.status(200).json({
        status: 'success',
        data: { listing },
    });
});

// DELETE /api/listings/:id (Protected - Soft delete own listing)
export const deleteListing = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const listing = await listingService.deleteListing(id, req.user!.id);

    if (!listing) {
        throw new AppError('Listing not found or you do not have permission', 404);
    }

    res.status(200).json({
        status: 'success',
        message: 'Listing deleted successfully',
    });
});
