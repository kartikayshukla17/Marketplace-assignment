// Orders API Slice
import { api } from './api';
import type { Order, ApiResponse } from '@/types';

interface CreateOrderRequest {
    listingId: string;
    message?: string;
}

interface UpdateOrderStatusRequest {
    id: string;
    status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
}

interface ProvideQuoteRequest {
    id: string;
    offerPrice: number;
}

export const ordersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get my orders as buyer
        getMyBuyerOrders: builder.query<ApiResponse<{ orders: Order[] }>, void>({
            query: () => '/orders/buyer',
            providesTags: ['Order'],
        }),

        // Get my orders as seller
        getMySellerOrders: builder.query<ApiResponse<{ orders: Order[] }>, void>({
            query: () => '/orders/seller',
            providesTags: ['Order'],
        }),

        // Get single order
        getOrder: builder.query<ApiResponse<{ order: Order }>, string>({
            query: (id) => `/orders/${id}`,
            providesTags: ['Order'],
        }),

        // Create order (purchase request)
        createOrder: builder.mutation<ApiResponse<{ order: Order }>, CreateOrderRequest>({
            query: (data) => ({
                url: '/orders',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Order'],
        }),

        // Update order status
        updateOrderStatus: builder.mutation<ApiResponse<{ order: Order }>, UpdateOrderStatusRequest>({
            query: ({ id, status }) => ({
                url: `/orders/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: ['Order'],
        }),

        // Cancel order (buyer action - before acceptance)
        cancelOrder: builder.mutation<ApiResponse<{ order: Order }>, string>({
            query: (id) => ({
                url: `/orders/${id}/cancel`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Order'],
        }),

        // Provide quote (seller action - for QUOTE listings)
        provideQuote: builder.mutation<ApiResponse<{ order: Order }>, ProvideQuoteRequest>({
            query: ({ id, offerPrice }) => ({
                url: `/orders/${id}/quote`,
                method: 'PATCH',
                body: { offerPrice },
            }),
            invalidatesTags: ['Order'],
        }),
    }),
});

export const {
    useGetMyBuyerOrdersQuery,
    useGetMySellerOrdersQuery,
    useGetOrderQuery,
    useCreateOrderMutation,
    useUpdateOrderStatusMutation,
    useCancelOrderMutation,
    useProvideQuoteMutation,
} = ordersApi;
