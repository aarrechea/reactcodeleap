// Imports
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../helpers/axios";


// Hook
export const useUpdatePost = () => {
    /*
    This function is used to update a post.
    It uses axiosInstance to make a PATCH request to the backend.
    */
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, data }: { postId: number; data: { title: string; content: string } }) => {
            const response = await axiosInstance.patch(`/post/${postId}/`, data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch posts after successful update
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
};
