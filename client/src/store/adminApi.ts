// Admin API Slice - Endpoints for admin-only operations
import { api } from './api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    _count: {
        listings: number;
        ordersAsBuyer: number;
        ordersAsSeller: number;
    };
}

interface Order {
    id: string;
    status: string;
    offerPrice: number | null;
    message: string | null;
    createdAt: string;
    buyer: {
        id: string;
        name: string;
        email: string;
    };
    seller: {
        id: string;
        name: string;
        email: string;
    };
    listing: {
        id: string;
        title: string;
        listingType: 'FIXED' | 'QUOTE';
    };
}

interface Listing {
    id: string;
    title: string;
    listingType: 'FIXED' | 'QUOTE';
    price: number | null;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
    isDeleted: boolean;
    isBlocked: boolean;
    createdAt: string;
    seller: {
        id: string;
        name: string;
        email: string;
    };
    category: {
        id: string;
        name: string;
    } | null;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface UsersResponse {
    users: User[];
    pagination: PaginationInfo;
}

interface OrdersResponse {
    orders: Order[];
    pagination: PaginationInfo;
}

interface ListingsResponse {
    listings: Listing[];
    pagination: PaginationInfo;
}

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all users (admin only)
        getAllUsers: builder.query<UsersResponse, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 20, search }) => {
                let url = `/admin/users?page=${page}&limit=${limit}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                return url;
            },
            transformResponse: (response: { success: boolean; data: UsersResponse }) => response.data,
            providesTags: ['User'],
        }),

        // Get all orders (admin only)
        getAllOrders: builder.query<OrdersResponse, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 20, search }) => {
                let url = `/admin/orders?page=${page}&limit=${limit}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                return url;
            },
            transformResponse: (response: { success: boolean; data: OrdersResponse }) => response.data,
            providesTags: ['Order'],
        }),

        // Get all listings (admin only)
        getAllListings: builder.query<ListingsResponse, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 20, search }) => {
                let url = `/admin/listings?page=${page}&limit=${limit}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                return url;
            },
            transformResponse: (response: { success: boolean; data: ListingsResponse }) => response.data,
            providesTags: ['Listing'],
        }),
        // Toggle user block status (admin only)
        toggleBlockUser: builder.mutation<{ success: boolean; data: User; message: string }, string>({
            query: (userId) => ({
                url: `/admin/users/${userId}/block`,
                method: 'PATCH',
            }),
            invalidatesTags: ['User'],
        }),

        // Toggle listing block status (admin only)
        toggleBlockListing: builder.mutation<{ success: boolean; data: Listing; message: string }, string>({
            query: (listingId) => ({
                url: `/admin/listings/${listingId}/block`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Listing'],
        }),
    }),
});

export const {
    useGetAllUsersQuery,
    useGetAllOrdersQuery,
    useGetAllListingsQuery,
    useToggleBlockUserMutation,
    useToggleBlockListingMutation
} = adminApi;
