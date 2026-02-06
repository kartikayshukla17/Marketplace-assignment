// Listings API Slice
import { api } from './api';
import type { Listing, ApiResponse, PaginatedResponse } from '@/types';

interface ListingsQuery {
    search?: string;
    page?: number;
    limit?: number;
}

interface CreateListingRequest {
    title: string;
    description: string;
    categoryId: string;
    listingType?: 'FIXED' | 'QUOTE';
    price?: number;  // Optional for QUOTE listings
    currency?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'PAUSED';
    images?: string[];
}

export const listingsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all active listings (public)
        getListings: builder.query<ApiResponse<PaginatedResponse<Listing>>, ListingsQuery>({
            query: (params) => ({
                url: '/listings',
                params,
            }),
            providesTags: ['Listing'],
        }),

        // Get single listing
        getListing: builder.query<ApiResponse<{ listing: Listing }>, string>({
            query: (id) => `/listings/${id}`,
            providesTags: ['Listing'],
        }),

        // Get my listings (seller)
        getMyListings: builder.query<ApiResponse<{ listings: Listing[] }>, void>({
            query: () => '/listings/seller/my',
            providesTags: ['Listing'],
        }),

        // Create listing
        createListing: builder.mutation<ApiResponse<{ listing: Listing }>, CreateListingRequest>({
            query: (data) => ({
                url: '/listings',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Listing'],
        }),

        // Update listing
        updateListing: builder.mutation<ApiResponse<{ listing: Listing }>, { id: string; data: Partial<CreateListingRequest> }>({
            query: ({ id, data }) => ({
                url: `/listings/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Listing'],
        }),

        // Delete listing
        deleteListing: builder.mutation<ApiResponse<void>, string>({
            query: (id) => ({
                url: `/listings/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Listing'],
        }),
    }),
});

export const {
    useGetListingsQuery,
    useGetListingQuery,
    useGetMyListingsQuery,
    useCreateListingMutation,
    useUpdateListingMutation,
    useDeleteListingMutation,
} = listingsApi;
