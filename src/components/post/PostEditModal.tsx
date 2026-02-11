// Imports
import './css/postEditModal.css';
import CreateEditStructure from './CreateEditStructure';


// Interfaces
interface PostEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any;
    //onEdit: () => void;
    onCloseStructureModal?: () => void;
}


// PostEditModal component
const PostEditModal = ({ isOpen, post, onCloseStructureModal }: PostEditModalProps) => {
    // Return
    return (
        <div style={{ visibility: isOpen ? 'visible' : 'hidden', opacity: isOpen ? 1 : 0 }} className="post-edit-modal-hidden">
            <div className="post-edit-modal-main">
                <CreateEditStructure post={post} onCloseStructureModal={onCloseStructureModal} />
            </div>
        </div>
    );
};


export default PostEditModal;
