// Imports
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import axiosInstance from "../../../helpers/axios";
import type { Post } from "../../../models/Post";


// Types for cursor pagination response
interface PaginatedResponse {
    results: Post[];
    next: string | null;
    previous: string | null;
}


// Hook
export const useListPost = (username?: string) => {
    /*
    This function is used to get the list of posts with cursor-based pagination.
    It uses axiosInstance to make a GET request to the backend.
    The backend returns a cursor-based paginated response with next/previous cursors.
    Optionally filters posts by username using the user__username__icontains parameter.
    */
    return useInfiniteQuery({
        queryKey: ['posts', username], // Include username in cache key

        queryFn: async ({ pageParam }) => {
            // If pageParam exists, use it as the full URL (it contains the cursor)
            // Otherwise, fetch the first page
            let url = pageParam || '/post/';

            // Add username filter if provided and we're on the first page
            if (username && !pageParam) {
                url += `?user__username__icontains=${encodeURIComponent(username)}`;
            }

            const response = await axiosInstance.get<PaginatedResponse>(url);
            return response.data;
        },

        initialPageParam: undefined as string | undefined,

        getNextPageParam: (lastPage) => {
            // lastPage is the response from the last page
            // next is the cursor for the next page
            return lastPage.next || undefined;
        },

        getPreviousPageParam: (firstPage) => {
            // firstPage is the response from the first page
            // previous is the cursor for the previous page
            return firstPage.previous || undefined;
        },

        // placeholderData is a React Query option to keep previous data while fetching to prevent page blinking
        placeholderData: keepPreviousData,
    });
};

