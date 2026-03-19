import { Router } from 'express';
import * as activityController from '../controllers/activityController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect all activity routes
router.use(protect);

router.get('/me', activityController.getMyActivities);

export default router;
