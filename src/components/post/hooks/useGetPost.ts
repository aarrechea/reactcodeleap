// Imports
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../helpers/axios";
import type { Post } from "../../../models/Post";


// Hook
export const useGetPost = (postId: number) => {
    /*
    This function is used to get a single post by ID.
    It uses axiosInstance to make a GET request to the backend.
    */
    return useQuery({
        queryKey: ['post', postId], // Key for caching the data
        queryFn: async () => {
            const response = await axiosInstance.get(`/post/${postId}/`);
            return response.data as Post;
        },
        enabled: !!postId, // Only run the query if postId is truthy
    });
};
