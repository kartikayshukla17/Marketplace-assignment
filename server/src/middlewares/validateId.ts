// ObjectId Validation Middleware
// Validates MongoDB ObjectId format on :id params

import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'bson';
import { AppError } from '../utils/AppError.js';

/**
 * Checks if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
    try {
        return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
    } catch {
        return false;
    }
};

/**
 * Middleware to validate :id param is a valid MongoDB ObjectId
 * Returns 400 Bad Request if invalid
 */
export const validateId = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (id && typeof id === 'string' && !isValidObjectId(id)) {
        return next(new AppError('Invalid ID format', 400));
    }

    next();
};

