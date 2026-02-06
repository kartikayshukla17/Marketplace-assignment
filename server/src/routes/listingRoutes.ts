// Listing Routes
// Defines listing endpoints

import { Router } from 'express';
import {
    getListings,
    getMyListings,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
} from '../controllers/listingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { listingCreateLimiter } from '../middlewares/rateLimiters.js';
import { validateId } from '../middlewares/validateId.js';

const router = Router();

// Public routes
router.get('/', getListings);
router.get('/:id', validateId, getListingById);

// Protected routes (Seller actions)
router.get('/seller/my', protect, getMyListings);
router.post('/', protect, listingCreateLimiter, createListing);  // 10 listings/min per user
router.put('/:id', protect, validateId, updateListing);
router.delete('/:id', protect, validateId, deleteListing);

export default router;
