// Environment Configuration
// Centralized environment variable access

import 'dotenv/config';

export const config = {
    // Server
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Client
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // Cookie
    cookieName: 'token',

    // Database
    databaseUrl: process.env.DATABASE_URL,
} as const;

// Validate required env vars in production
if (config.nodeEnv === 'production') {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET must be defined in production');
    }
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL must be defined in production');
    }
}
