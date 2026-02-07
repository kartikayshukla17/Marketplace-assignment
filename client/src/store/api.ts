// RTK Query API - Base configuration
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Custom fetchBaseQuery with timeout
const baseQueryWithTimeout = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
    timeout: 60000, // 60 seconds for cold starts
});

// Retry logic for failed requests
const baseQueryWithRetry = retry(baseQueryWithTimeout, {
    maxRetries: 2, // Retry up to 2 times
});

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithRetry,
    tagTypes: ['User', 'Listing', 'Order', 'Category'],
    endpoints: () => ({}),
});
