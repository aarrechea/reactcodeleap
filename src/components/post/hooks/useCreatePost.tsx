import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../helpers/axios";
import type { Post } from "../../../models/Post";

type CreatePostData = Pick<Post, 'title' | 'content'>;

interface UseCreatePostOptions {
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export const useCreatePost = ({ onSuccess, onError }: UseCreatePostOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPost: CreatePostData) => {
            return axiosInstance.post('/post/', newPost);
        },
        onSuccess: () => {
            // Invalidate and refetch posts after successful creation
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            console.log("Error response:", error.response?.data);
            if (onError) onError(error);
        },
    });
};
