import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

// ==========================================
// RATE LIMITER CONFIGURATION
// ==========================================
// Time windows kept under 1 min for demo purposes
// In production, consider longer windows (15-60 min)

interface RateLimitConfig {
    windowMs: number;
    max: number;
    message: string;
}

// Factory function for creating consistent rate limiters
const createRateLimiter = (config: RateLimitConfig) => rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: config.message,
    },
});

// Factory for user-based rate limiting (uses authenticated user ID only)
// Note: These limiters run AFTER auth middleware, so user.id is always available
const createUserBasedLimiter = (config: RateLimitConfig) => rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    // Use only user ID - these routes are protected, so user is always authenticated
    keyGenerator: (req: Request) => {
        return (req as any).user?.id || 'unauthenticated';
    },
    // Skip IP validation since we're using user ID only
    validate: { xForwardedForHeader: false },
    message: {
        status: 'error',
        message: config.message,
    },
});

// ==========================================
// GLOBAL LIMITERS
// ==========================================

// General API limiter - prevents DDoS and abuse
export const apiLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: 'Too many requests, please try again later.',
});

// ==========================================
// AUTH LIMITERS
// ==========================================

// Strict limiter for auth endpoints - prevents brute-force
export const authLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute  
    max: 5,
    message: 'Too many login attempts, please try again after 1 minute.',
});

// ==========================================
// RESOURCE CREATION LIMITERS
// ==========================================

// Listing creation limiter - prevents spam listings
// 10 listings per minute per user
export const listingCreateLimiter = createUserBasedLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    message: 'Listing creation limit reached. Please wait before creating more listings.',
});

// Order/Purchase request limiter - prevents purchase spam
// 10 orders per minute per user
export const orderCreateLimiter = createUserBasedLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    message: 'Purchase request limit reached. Please wait before sending more requests.',
});

// Quote provision limiter - prevents seller quote flooding
// 20 quotes per minute per seller
export const quoteProvisionLimiter = createUserBasedLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
    message: 'Quote limit reached. Please wait before providing more quotes.',
});

// ==========================================
// LEGACY EXPORT (backwards compatibility)
// ==========================================
export const createLimiter = listingCreateLimiter;

