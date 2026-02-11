// Imports
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../helpers/axios";

// Hook
export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: number) => {
            return axiosInstance.post(`/post/${postId}/like/`);
        },
        onSuccess: () => {
            // Invalidate and refetch the posts list to update the UI
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};
