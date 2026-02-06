// Admin Middleware - Ensure user is an admin

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        throw new AppError('Authentication required', 401);
    }

    if (req.user.role !== 'ADMIN') {
        throw new AppError('Admin access required', 403);
    }

    next();
};
