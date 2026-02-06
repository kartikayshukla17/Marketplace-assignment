// RTK Query API - Base configuration
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        credentials: 'include', // Send cookies with requests
    }),
    tagTypes: ['User', 'Listing', 'Order', 'Category'],
    endpoints: () => ({}),
});
