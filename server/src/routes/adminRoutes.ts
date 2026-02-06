// Admin Routes - Protected admin-only routes

import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/adminAuth.js';
import { validateId } from '../middlewares/validateId.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication AND admin role
router.use(protect, requireAdmin);

// GET /api/admin/users - Get all users with pagination
router.get('/users', adminController.getAllUsers);

// PATCH /api/admin/users/:id/block - Block/Unblock user
router.patch('/users/:id/block', validateId, adminController.toggleUserBlock);

// GET /api/admin/orders - Get all orders with pagination
router.get('/orders', adminController.getAllOrders);

// GET /api/admin/listings - Get all listings with pagination
router.get('/listings', adminController.getAllListings);

// PATCH /api/admin/listings/:id/block - Block/Unblock listing
router.patch('/listings/:id/block', validateId, adminController.toggleListingBlock);

export default router;

