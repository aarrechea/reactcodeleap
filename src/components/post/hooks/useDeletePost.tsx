// Imports
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../helpers/axios";


// Hook
export const useDeletePost = () => {
    /*
    This function is used to delete a post.
    It uses axiosInstance to make a DELETE request to the backend.
    */
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: number) => {
            const response = await axiosInstance.delete(`/post/${postId}/`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch posts after successful deletion
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
};
