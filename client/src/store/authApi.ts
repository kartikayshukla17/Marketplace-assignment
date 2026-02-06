// Auth API Slice
import { api } from './api';
import type { User, ApiResponse } from '@/types';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role?: 'USER' | 'ADMIN';
}

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Login
        login: builder.mutation<ApiResponse<void>, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),

        // Register
        register: builder.mutation<ApiResponse<void>, RegisterRequest>({
            query: (data) => ({
                url: '/auth/register',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        // Get current user
        getMe: builder.query<ApiResponse<User>, void>({
            query: () => '/auth/me',
            providesTags: ['User'],
        }),

        // Logout
        logout: builder.mutation<ApiResponse<void>, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Reset API state to clear cached user data immediately
                    dispatch(authApi.util.resetApiState());
                } catch {
                    // Ignore errors
                }
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetMeQuery,
    useLogoutMutation,
} = authApi;
