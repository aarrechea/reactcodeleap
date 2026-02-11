// Imports
import { useState, type CSSProperties } from "react";
import type { Post } from "../../models/Post";
import "./css/createEditStructure.css";
import { useCreatePost } from "./hooks/useCreatePost";
import { useUpdatePost } from "./hooks/useUpdatePost";


// Interfaces
interface CreateEditStructureInterface {
    post?: Post;
    //onEdit?: () => void;
    onCloseStructureModal?: () => void;
}

interface TitleInterface {
    text: string;
    style: CSSProperties;
}


// Component
const CreateEditStructure = ({ post, onCloseStructureModal }: CreateEditStructureInterface) => {
    // Constants
    const ORIGINAL_TITLE = "What's on your mind?";

    // States
    const [mainTitle, setMainTitle] = useState<TitleInterface>({ text: ORIGINAL_TITLE, style: {} });
    const [postContent, setPostContent] = useState(post?.content || '');
    const [postTitle, setPostTitle] = useState(post?.title || '');

    // Button text based on mode (create vs update)
    const buttonText = post ? 'Update' : 'Create';


    //#region Create/Update post
    const { mutate: createMutate } = useCreatePost(); // Mutation for creating a post
    const { mutate: updateMutate } = useUpdatePost(); // Mutation for updating a post

    const onSuccess = () => {
        const successMessage = post ? "Post Updated Successfully" : "Post Created Successfully";
        setMainTitle({ text: successMessage, style: { color: "green" } });

        setTimeout(() => {
            setMainTitle({ text: "What's on your mind?", style: {} });
        }, 3000);

        // Call onEdit callback if updating
        // if (post && onEdit) {
        //     onEdit();
        // }
    };

    const onError = (error: any) => {
        // Extract error message from backend response
        const errorType = post ? "Updating" : "Creating";
        const errorMessage = error.response?.data?.content
            || `Error ${errorType} Post`;

        setMainTitle({ text: errorMessage, style: { color: "red" } });

        setTimeout(() => {
            setMainTitle({ text: "What's on your mind?", style: {} });
        }, 3000);
    };
    //#endregion

    // Handle post creation/update
    const handlePostCreate = () => {
        // Title and content validation
        if (postTitle.length === 0 || postContent.length === 0) {
            setMainTitle({ text: "Title and content cannot be empty", style: { color: "red" } });

            setTimeout(() => {
                setMainTitle({ text: ORIGINAL_TITLE, style: {} });
            }, 3000);
            return;
        }

        // Create post data
        const data = {
            title: postTitle,
            content: postContent,
        };

        // Check if we're updating or creating
        if (post) {
            // Update existing post
            updateMutate({ postId: post.id, data }, { onSuccess, onError });
        } else {
            // Create new post
            createMutate(data, { onSuccess, onError });

            // Clear post title and content only when creating
            setPostTitle('');
            setPostContent('');
        }
    };


    return (
        <>
            {/* Create edit structure header */}
            <div className="create-edit-structure-header">
                <h3 style={mainTitle.style}>{mainTitle.text}</h3>
            </div>

            {/* Create edit structure title and content */}
            <div className="create-post-title">
                <label htmlFor="post-title">
                    Title <span style={{ color: 'gray', fontSize: '0.875rem' }}>({postTitle.length}/100)</span>
                </label>
                <input
                    type="text"
                    id="post-title"
                    placeholder="Hello World"
                    value={postTitle}
                    maxLength={100}
                    onChange={(e) => setPostTitle(e.target.value.slice(0, 100))}
                />
            </div>

            {/* Create edit structure content */}
            <div className="create-edit-structure-content">
                <label htmlFor="post-content">
                    Content <span style={{ color: 'gray', fontSize: '0.875rem' }}>({postContent.length}/500)</span>
                </label>
                <textarea
                    id="post-content"
                    placeholder="Content here"
                    value={postContent}
                    maxLength={500}
                    onChange={(e) => setPostContent(e.target.value.slice(0, 500))}
                />
            </div>

            {/* Create edit structure button to create/update the post */}
            <div className="create-edit-structure-button">
                <button
                    className="create-edit-structure-button-execute"
                    onClick={handlePostCreate}
                >
                    {buttonText}
                </button>

                {/* Close button only when updating */}
                {post && (
                    <button
                        className="create-edit-structure-button-close"
                        onClick={onCloseStructureModal}
                    >
                        Close
                    </button>
                )}
            </div>
        </>
    );
};


// Exports
export default CreateEditStructure;
