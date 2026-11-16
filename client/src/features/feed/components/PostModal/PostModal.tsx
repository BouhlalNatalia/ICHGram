import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Heart, Smile, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../../hook/storeHooks';
import { setCurrentPost, toggleLikeThunk } from '../../model/feedSlice';
import { usePostActions } from '../../../feed/hook/usePostActions';
import ActionMenu from '../../../../components/ui/ActionMenu/ActionMenu';
import CreatePostModal from '../../../../components/CreatePostModal/CreatePostModal';
import { getImageUrl } from '../../../../config';
import styles from './PostModal.module.css';
import { getSmartDate, formatRelativeTime } from '../../../../utils/formatDate';
import ScrollToTop from '../../../../utils/ScrollToTop';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  [key: string]: any;
}

 const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const post = useAppSelector((state) => state.feed.currentPost);
  const { user } = useAppSelector((state) => state.auth);

  const handleClose = () => {
    localStorage.removeItem('openedPostId');
    dispatch(setCurrentPost(null));
    onClose();
  };

  const closeEverythingAfterDelete = () => {
    setShowActionMenu(false);
    handleClose();
  };

  const {
    handleToggleLikeComment,
    commentText,
    setCommentText,
    handlePostComment,
    commentInputRef,
    showEmojiPicker,
    setShowEmojiPicker,
    addEmoji,
    handleDeletePost,
    handleCopyLink,
    handleGoToPost,
    handleUpdatePost
  } = usePostActions(post, closeEverythingAfterDelete);

  const handleUserClick = (username: string | undefined) => {
    if (!username) return;
    handleClose();
    navigate(`/profile/${username}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const currentUserId = String(user?._id || (user as any)?.id || '');
  const isMyPost = String(post.user?._id || (post.user as any)?.id) === currentUserId;

  const isPostLiked = !!post.likes?.some((like: any) => {
    const likeId = typeof like === 'object' && like !== null ? (like._id || like.id) : like;
    return String(likeId) === currentUserId;
  });

  const handlePostLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLikeThunk(post._id));
  };

  const postStateHash = `${post._id}-${post.comments?.length || 0}-${post.likes?.length || 0}`;

  return (
    <>
      <div className={styles.overlay} onClick={handleClose}>
        <button className={styles.closeBtn} onClick={handleClose} type="button">
          <X size={26} color="#ffffff" />
        </button>

        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.imageSection}>
            {post.image && (
              <img
                src={getImageUrl(post.image)}
                alt="Post content"
                className={styles.mainImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500?text=Image+Not+Found';
                }}
              />
            )}
          </div>

          <div className={styles.infoSection} key={postStateHash}>
            <div className={styles.header}>
              <div
                className={styles.headerUser}
                onClick={() => handleUserClick(post.user?.username)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.avatarRing}>
                  <img
                    src={getImageUrl(post.user?.avatar)}
                    alt={post.user?.username || 'user'}
                    className={styles.ringAvatarImg}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <span className={styles.username}>{post.user?.username || 'user'}</span>
              </div>

              <button
                className={styles.moreBtn}
                type="button"
                style={{ cursor: 'pointer', position: 'relative', zIndex: 9999 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowActionMenu(true);
                }}
              >
                <span style={{ fontSize: '20px', letterSpacing: '1px', lineHeight: 1 }}>•••</span>
              </button>
            </div>

            <div className={styles.commentsArea}>
              {post.description && (
                <div className={styles.commentItem}>
                  <div
                    className={styles.avatarRing}
                    onClick={() => handleUserClick(post.user?.username)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={getImageUrl(post.user?.avatar)}
                      alt="Avatar"
                      className={styles.ringAvatarImg}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentText}>
                      <span
                        className={styles.staticUsername}
                        onClick={() => handleUserClick(post.user?.username)}
                        style={{ cursor: 'pointer' }}
                      >
                        {post.user?.username}
                      </span>
                      {post.description}
                    </div>
                    <div className={styles.commentMetaRow}>
                      <span className={styles.commentTime}>{getSmartDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}

              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => {
                  const commentLikes = comment.likes || [];
                  const isCommentLiked = commentLikes.some((like: any) => {
                    const likeId = typeof like === 'object' && like !== null ? (like._id || like.id) : like;
                    return String(likeId) === currentUserId;
                  });

                  const isUserObject = typeof comment.user === 'object' && comment.user !== null;
                  const commentAvatar = isUserObject ? (comment.user as any).avatar : null;
                  const commentUsername = isUserObject ? (comment.user as any).username : 'user';

                  return (
                    <div key={comment._id} className={styles.commentItem}>
                      <img
                        src={getImageUrl(commentAvatar)}
                        alt="Avatar"
                        className={styles.miniAvatar}
                        onClick={() => handleUserClick(commentUsername)}
                        style={{ cursor: 'pointer' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                        }}
                      />
                      <div className={styles.commentBody}>
                        <div className={styles.commentText}>
                          <span
                            className={styles.staticUsername}
                            onClick={() => handleUserClick(commentUsername)}
                            style={{ cursor: 'pointer' }}
                          >
                            {commentUsername}
                          </span>
                          {comment.text}
                        </div>
                        <div className={styles.commentMetaRow}>
                          <span className={styles.commentTime}>{formatRelativeTime(post.createdAt)}</span>
                          {commentLikes.length > 0 && (
                            <span className={styles.commentLikesCount}>Likes: {commentLikes.length}</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.commentLikeBtn}
                        style={{ border: 'none', background: 'none' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLikeComment(comment._id);
                        }}
                      >
                        <Heart
                          size={14}
                          color={isCommentLiked ? "#ed4956" : "#262626"}
                          fill={isCommentLiked ? "#ed4956" : "none"}
                        />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className={styles.noComments}>Нет комментариев.</div>
              )}
            </div>

            <div className={styles.footer}>
              <div className={styles.metaSection}>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.commentLikeBtn}
                    style={{ border: 'none', background: 'none', padding: 0 }}
                    onClick={handlePostLikeClick}
                  >
                    <Heart
                      size={24}
                      color={isPostLiked ? "#ed4956" : "#262626"}
                      fill={isPostLiked ? "#ed4956" : "none"}
                    />
                  </button>
                </div>

                <span className={styles.likesCount}>
                  {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}
                </span>

                <span className={styles.postDate}>
                  {getSmartDate(post.createdAt)}
                </span>
              </div>

              <div className={styles.addCommentContainer}>
                <div className={styles.addComment}>
                  <span className={styles.emojiIcon} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <Smile size={24} />
                  </span>
                  <input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Add comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                    className={styles.commentInput}
                  />
                  <button
                    type="button"
                    className={styles.postBtn}
                    onClick={handlePostComment}
                    disabled={!commentText.trim()}
                  >
                    Send
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className={styles.emojiPickerWrapper}>
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        addEmoji(emojiData.emoji);
                      }}
                      autoFocusSearch={false}
                      theme={Theme.LIGHT}
                      width={300}
                      height={350}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActionMenu && (
        <ActionMenu
          onClose={() => setShowActionMenu(false)}
          onCopyLink={handleCopyLink}
          onGoToPost={handleGoToPost}
          onDelete={isMyPost ? handleDeletePost : undefined}
          onEdit={isMyPost ? () => { setIsEditOpen(true); setShowActionMenu(false); } : undefined}
        />
      )}

      {isEditOpen && user && (
        <React.Suspense fallback={null}>
          <CreatePostModal
            user={user}
            onClose={() => setIsEditOpen(false)}
            initialData={post}
            onPublish={handleUpdatePost}
          />
        </React.Suspense>
      )}

      {isOpen && <ScrollToTop />}
    </>
  );
};

export default PostModal;