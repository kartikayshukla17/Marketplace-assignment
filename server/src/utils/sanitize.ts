// Input Sanitization Utilities
// Prevents XSS attacks by escaping HTML entities

import validator from 'validator';

/**
 * Sanitizes user-provided text by escaping HTML entities
 * and trimming whitespace
 */
export const sanitizeText = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return text;
    }
    return validator.escape(validator.trim(text));
};

/**
 * Sanitizes an object's string properties
 * Only sanitizes specified keys
 */
export const sanitizeObject = <T extends Record<string, any>>(
    obj: T,
    keys: (keyof T)[]
): T => {
    const sanitized = { ...obj };

    for (const key of keys) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeText(sanitized[key]) as T[keyof T];
        }
    }

    return sanitized;
};
