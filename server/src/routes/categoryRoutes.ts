// Category Routes
// Defines API endpoints for category operations

import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Public: Get all categories
router.get('/', categoryController.getCategories);

// Protected: Create a new category
router.post('/', protect, categoryController.createCategory);

export default router;
