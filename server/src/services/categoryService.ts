// Category Service
// Handles business logic for category operations

import { prisma } from '../lib/prisma.js';

/**
 * Get all categories ordered by name
 */
export const getAllCategories = async () => {
    return prisma.category.findMany({
        orderBy: { name: 'asc' },
    });
};

/**
 * Get a category by its name (case-insensitive check)
 */
export const getCategoryByName = async (name: string) => {
    return prisma.category.findFirst({
        where: {
            name: {
                equals: name,
                mode: 'insensitive',
            },
        },
    });
};

/**
 * Get a category by ID
 */
export const getCategoryById = async (id: string) => {
    return prisma.category.findUnique({
        where: { id },
    });
};

/**
 * Create a new category
 * Throws if a category with the same name already exists
 */
export const createCategory = async (name: string) => {
    // Check for existing category (case-insensitive)
    const existing = await getCategoryByName(name);
    if (existing) {
        throw new Error('Category already exists');
    }

    return prisma.category.create({
        data: { name: name.trim() },
    });
};
