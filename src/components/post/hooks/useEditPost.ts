// Imports
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../helpers/axios";


// Types
interface EditPostData {
    postId: number;
    title: string;
    content: string;
}


// Hook
export const useEditPost = () => {
    /*
    This function is used to edit/update a post.
    It uses axiosInstance to make a PATCH request to the backend.
    */
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, title, content }: EditPostData) => {
            const response = await axiosInstance.patch(`/post/${postId}/`, {
                title,
                content,
            });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch posts after successful edit
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
};
