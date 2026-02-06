// Auth Controller
// Handles Register and Login with JWT in HttpOnly Cookie

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { registerSchema, loginSchema } from '../validations/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

// Helper: Set JWT Cookie
const sendTokenResponse = (res: Response, userId: string, statusCode: number) => {
    const token = jwt.sign({ id: userId }, config.jwtSecret as jwt.Secret, {
        expiresIn: '7d',
    });

    const isProduction = config.nodeEnv === 'production';

    res.cookie(config.cookieName, token, {
        httpOnly: true,
        secure: isProduction, // MUST be true in production for cross-site cookies
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site (Vercel -> Render)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(statusCode).json({
        status: 'success',
        message: statusCode === 201 ? 'User registered successfully' : 'Login successful',
    });
};

// POST /api/auth/register
export const register = catchAsync(async (req: Request, res: Response) => {
    // Validate input
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
    }

    const { email, password, name, role } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with specified role or default to USER
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
            role: role || 'USER', // Default to USER if not specified
        },
    });

    sendTokenResponse(res, user.id, 201);
});

// POST /api/auth/login
export const login = catchAsync(async (req: Request, res: Response) => {
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
        throw new AppError(validation.error.issues[0].message, 400);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    // Check if blocked
    if (user.isBlocked) {
        throw new AppError('Your account has been blocked', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    sendTokenResponse(res, user.id, 200);
});

// POST /api/auth/logout
export const logout = catchAsync(async (req: Request, res: Response) => {
    res.cookie(config.cookieName, '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
});

// GET /api/auth/me
export const getMe = catchAsync(async (req: Request, res: Response) => {
    // req.user is set by auth middleware
    const user = req.user;

    res.status(200).json({
        status: 'success',
        data: {
            id: user!.id,
            email: user!.email,
            name: user!.name,
            role: user!.role,
        },
    });
});
