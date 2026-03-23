import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { prisma } from '../lib/prisma.js';

// GET /api/activities/me (Protected)
export const getMyActivities = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    
    // Optional query param for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
        prisma.activityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.activityLog.count({ where: { userId } })
    ]);

    res.status(200).json({
        status: 'success',
        results: activities.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: { activities },
    });
});
