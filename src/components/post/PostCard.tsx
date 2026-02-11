import type { Post } from "../../models/Post";
import './css/postCard.css';
import DeleteIcon from "./icons/DeleteIcon";
import EditIcon from "./icons/EditIcon";
import { formatDistanceToNow } from "date-fns";
import PostDeleteModal from "./PostDeleteModal";
import { useState, useEffect } from "react";
import { useDeletePost } from "./hooks/useDeletePost";
import { useLikePost } from "./hooks/useLikePost";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import PostEditModal from "./PostEditModal";
import HeartIcon from "./icons/HeartIcon";


// Component
const PostCard = ({ post }: { post: Post }) => {
    // Time elapsed from post creation.
    const elapsedTime = formatDistanceToNow(new Date(post.updated_datetime));

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { mutate: deletePost } = useDeletePost();
    const { mutate: likePost } = useLikePost();

    // Redux
    const currentUser = useAppSelector((state: RootState) => state.auth.user);


    const handleCloseStructureModal = () => {
        /*
        Once the user click the close button, the modal is closed.
        */
        setIsEditOpen(false);
    };

    //#region Delete post
    const handleDeletePost = () => {
        /*
        Once the user click the delete icon, the modal is opened to confirm the deletion.
        */
        setIsOpen(true);
    };

    const handleConfirmDelete = () => {
        /*
        Once the user confirm the deletion, the post is deleted through the mutation.
        */
        deletePost(post.id);
        setIsOpen(false);
    };
    //#endregion

    // Edit post
    const handleEditPost = () => {
        setIsEditOpen(true);
    };


    //#region Like post logic.
    // Check if the current user has liked the post (source of truth)
    const isLikedProp = typeof post.is_liked === 'boolean'
        ? post.is_liked
        : Array.isArray(post.is_liked)
            ? post.is_liked.some((like) => like.user === currentUser?.id)
            : false;

    // Local state for optimistic UI
    const [isLiked, setIsLiked] = useState(isLikedProp);
    const [likeCount, setLikeCount] = useState(post.likes_count || 0);

    // Sync local state with props (e.g. after refetch)
    useEffect(() => {
        setIsLiked(isLikedProp);
        setLikeCount(post.likes_count || 0);

    }, [isLikedProp, post.likes_count]);

    const handleLikePost = () => {
        if (isLiked) {
            setLikeCount((prev) => Math.max(0, prev - 1));

        } else {
            setLikeCount((prev) => prev + 1);
        }

        setIsLiked(!isLiked); // Optimistic update
        likePost(post.id);
    };
    //#endregion


    // Return
    return (
        <div className="post-card-main">
            <PostDeleteModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                post={post}
                onDelete={handleConfirmDelete}
            />

            <PostEditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                post={post}
                onCloseStructureModal={handleCloseStructureModal}
            />


            {/* Post card header and icons */}
            <div className="post-card-header">
                {/* Post card header title */}
                <h1>{post.title}</h1>

                {/* Post card header icons */}
                <div className="post-card-header-icons">
                    <div className="post-card-heart-icon-container">
                        <p>{likeCount}</p>

                        <HeartIcon
                            className="post-card-heart-icon"
                            onClick={handleLikePost}
                            fill={isLiked ? "red" : "none"}
                            stroke={isLiked ? "red" : "currentColor"}
                        />
                    </div>
                    {currentUser?.username === post.username && (
                        <>
                            <DeleteIcon className="post-card-delete-icon" onClick={handleDeletePost} />
                            <EditIcon className="post-card-edit-icon" onClick={handleEditPost} />
                        </>
                    )}
                </div>
            </div>

            {/* Post card content */}
            <div className="post-card-content">
                <div className="post-card-content-header">
                    <p>@{post.username}</p>
                    <p>{elapsedTime}</p>
                </div>

                <div className="post-card-content-body">
                    <p>{post.content}</p>
                </div>
            </div>
        </div>
    );
};


// Export
export default PostCard;
