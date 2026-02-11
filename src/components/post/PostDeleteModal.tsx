// Imports
import "./css/postDeleteModal.css";
import type { Post } from "../../models/Post";


// Interfaces
interface PostDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    onDelete: () => void;
}


// Component
const PostDeleteModal = ({ isOpen, onClose, post, onDelete }: PostDeleteModalProps) => {

    // Return
    return (
        <div style={{ visibility: isOpen ? "visible" : "hidden", opacity: isOpen ? 1 : 0 }} className='post-delete-modal-hidden'>
            <div className="post-delete-modal-main">
                {/* Post delete modal header */}
                <div className="post-delete-modal-header">
                    <h1>Delete Post</h1>
                </div>

                {/* Post delete modal body */}
                <div className="post-delete-modal-body">
                    <p>Are you sure you want to delete this post?</p>
                    <h3>{post.title}</h3>
                </div>

                {/* Post delete modal buttons */}
                <div className="post-delete-modal-buttons">
                    <button className="post-delete-modal-cancel-button" onClick={onClose}>Cancel</button>
                    <button className="post-delete-modal-delete-button" onClick={onDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
};


// Export
export default PostDeleteModal;

