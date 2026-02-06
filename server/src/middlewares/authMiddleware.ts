// Auth Middleware
// Protects routes by verifying JWT from cookie

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Extend Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                isBlocked: boolean;
            };
        }
    }
}

// Protect Route - Requires Authentication
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Get token from cookie
    const token = req.cookies[config.cookieName];

    if (!token) {
        throw new AppError('Please login to access this resource', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    // Find user
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isBlocked: true,
        },
    });

    if (!user) {
        throw new AppError('User not found', 401);
    }

    if (user.isBlocked) {
        throw new AppError('Your account has been blocked', 403);
    }

    // Attach user to request
    req.user = user;
    next();
});

// Restrict to specific roles
export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Please login to access this resource', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};
