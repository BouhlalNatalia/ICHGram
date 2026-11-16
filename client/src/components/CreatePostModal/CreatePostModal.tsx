import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Smile, UploadCloud } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { useCreatePost } from '../../hook/useCreatePost'; 
import { getImageUrl } from '../../config';
import type { IUser } from '../../types/index';
import type { IPost } from '../../features/feed/types/feed.types'; 
import styles from './CreatePostModal.module.css';

interface CreatePostModalProps {
  user: IUser;
  onClose: () => void;
  onPublish?: (data: { file: File | null; caption: string }) => Promise<IPost | undefined | void>; 
  initialData?: IPost; 
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  user, 
  onClose, 
  onPublish, 
  initialData 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    file,
    caption,
    setCaption,
    imagePreview,
    isLoading,
    handleFileChange,
    handleSubmit,
    addEmoji,
    textAreaRef
  } = useCreatePost(onPublish, initialData);

  const isSubmitting = isLoading; 
  const isEditMode = !!initialData;

  const onEmojiClick = (emojiData: EmojiClickData) => {
    addEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return ReactDOM.createPortal(
    <div 
      className={styles.modalOverlay} 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <button className={styles.closeModalBtn} onClick={onClose} type="button">
        <X size={28} color="white" />
      </button>

      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <button 
            onClick={onClose} 
            className={styles.cancelBtn} 
            type="button" 
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <h3 className={styles.headerTitle}>
            {isEditMode ? 'Edit info' : 'Create new post'}
          </h3>

          <button
            onClick={() => handleSubmit(onClose)} 
            className={styles.shareBtn}
            disabled={isSubmitting || (!isEditMode && !file)}
            type="button"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Done' : 'Share')}
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.photoSection}>
            {imagePreview ? (
              <label className={styles.imageContainer}>
                <div className={styles.imageChangeOverlay}>
                  <UploadCloud size={48} strokeWidth={1.5} color="white" />
                </div>
                <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.hiddenInput}
                />
              </label>
            ) : (
              <label 
                className={styles.uploadPlaceholder}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileChange({ target: { files: e.dataTransfer.files } } as any);
                  }
                }}
              >
                <UploadCloud size={96} strokeWidth={1} color="#c7c7c7" />
                <span>Drag photos and videos here</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.hiddenInput}
                />
              </label>
            )}
          </div>

          <div className={styles.infoSection}>
            <div className={styles.userInfo}>
              <img 
                src={getImageUrl(user?.avatar)} 
                className={styles.avatar} 
                alt={user?.username} 
              />
              <span className={styles.username}>{user?.username}</span>
            </div>

            <textarea
              ref={textAreaRef} 
              className={styles.captionArea}
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
              disabled={isSubmitting}
            />

            <div className={styles.captionFooter}>
              <div className={styles.emojiWrapper}>
                <button 
                  type="button" 
                  className={styles.emojiBtn}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={22} color="#8e8e8e" />
                </button>

                {showEmojiPicker && (
                  <div className={styles.emojiPickerContainer}>
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      theme={Theme.LIGHT}
                      width={300}
                      height={400}
                    />
                  </div>
                )}
              </div>
              <span className={styles.charCount}>
                {caption.length.toLocaleString()}/2200
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreatePostModal;