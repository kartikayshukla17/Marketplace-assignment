import { api } from './api';

export interface Activity {
    id: string;
    type: 'ORDER_CREATED' | 'ORDER_ACCEPTED' | 'ORDER_REJECTED' | 'ORDER_COMPLETED' | 'QUOTE_PROVIDED';
    message: string;
    orderId: string | null;
    createdAt: string;
    userId: string;
}

export interface ActivityResponse {
    status: string;
    results: number;
    total: number;
    page: number;
    totalPages: number;
    data: {
        activities: Activity[];
    };
}

export const activityApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMyActivities: builder.query<ActivityResponse, { page?: number; limit?: number } | void>({
            query: (params) => ({
                url: '/activities/me',
                params: params || undefined,
            }),
            providesTags: ['Activity'],
        }),
    }),
});

export const { useGetMyActivitiesQuery } = activityApi;
