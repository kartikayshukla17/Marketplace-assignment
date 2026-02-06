// Categories API Slice
import { api } from './api';
import type { ApiResponse } from '@/types';

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}

interface CreateCategoryRequest {
    name: string;
}

export const categoriesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all categories
        getCategories: builder.query<ApiResponse<{ categories: Category[] }>, void>({
            query: () => '/categories',
            providesTags: ['Category'],
        }),

        // Create a new category
        createCategory: builder.mutation<ApiResponse<{ category: Category }>, CreateCategoryRequest>({
            query: (data) => ({
                url: '/categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
} = categoriesApi;
