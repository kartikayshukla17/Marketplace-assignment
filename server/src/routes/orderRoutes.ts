// Order Routes
// Defines order endpoints

import { Router } from 'express';
import {
    getMyBuyerOrders,
    getMySellerOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    provideQuote,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { orderCreateLimiter, quoteProvisionLimiter } from '../middlewares/rateLimiters.js';
import { validateId } from '../middlewares/validateId.js';

const router = Router();

// All routes are protected
router.use(protect);

// Buyer routes
router.get('/buyer', getMyBuyerOrders);
router.post('/', orderCreateLimiter, createOrder);           // 10 orders/min per user
router.patch('/:id/cancel', validateId, cancelOrder);

// Seller routes
router.get('/seller', getMySellerOrders);
router.patch('/:id/quote', validateId, quoteProvisionLimiter, provideQuote);  // 20 quotes/min per seller
router.patch('/:id/status', validateId, updateOrderStatus);

// Shared routes
router.get('/:id', validateId, getOrderById);

export default router;
