// Category Controller
// Handles HTTP requests for category endpoints

import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/categoryService.js';

/**
 * GET /categories
 * Get all categories
 */
export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categories = await categoryService.getAllCategories();

        res.json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /categories
 * Create a new category
 */
export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }

        const category = await categoryService.createCategory(name);

        res.status(201).json({
            success: true,
            data: { category },
        });
    } catch (error: any) {
        if (error.message === 'Category already exists') {
            return res.status(409).json({
                success: false,
                message: 'A category with this name already exists',
            });
        }
        next(error);
    }
};
