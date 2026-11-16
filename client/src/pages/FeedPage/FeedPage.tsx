import React from 'react';
import { useFeed } from '../../hook/useFeed';
import PostCard from '../../features/feed/components/PostCard/PostCard';
import PostModal from '../../features/feed/components/PostModal/PostModal';
import CreatePostModal from '../../components/CreatePostModal/CreatePostModal';
import StoriesList from '../../features/feed/components/StoriesList/StoriesList';
import EndOfFeed from '../../components/ui/EndOfFeed/EndOfFeed';

import type { IPost, IComment } from '../../features/feed/types/feed.types';
import styles from './FeedPage.module.css';

const FeedPage: React.FC = () => {
  const {
    posts,
    user,
    isLoading,
    activePost,
    handleOpenPostModal,
    handleClosePostModal,
    isEditModalOpen,
    setIsEditModalOpen,
    postToEdit,
    setPostToEdit,
    handleLike,
    handleDeletePost,
    handleOpenEditModal,
    handleUpdatePost,
    handleToggleFollow,
  } = useFeed();

  if (!user) return null;

  return (
    <div className={styles.feedPage}>

      <div className={styles.storiesWrapper}>
        <StoriesList />
      </div>

      <div className={styles.feedContainer}>
        {posts.map((post: IPost) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={user._id}
            onLike={handleLike}
            onFollow={handleToggleFollow}
            onDelete={handleDeletePost}
            onOpenModal={() => handleOpenPostModal(post)}
            onEdit={handleOpenEditModal}
          />
        ))}

        {!isLoading && posts.length > 0 && <EndOfFeed />}
      </div>

      {/* POST MODAL */}
      {activePost && (
        <PostModal
          isOpen={!!activePost}
          onClose={handleClosePostModal}
        />
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && postToEdit && (
        <CreatePostModal
          user={user}
          initialData={{
            ...postToEdit,
            likes:
              postToEdit.likes?.map((like: string | { _id: string }) =>
                typeof like === 'object' && like !== null ? like._id : String(like)
              ) || [],
            comments:
              postToEdit.comments?.map((comment: IComment) => ({
                ...comment,
                user:
                  typeof comment.user === 'object' && comment.user !== null
                    ? {
                        _id: (comment.user as any)._id || '',
                        username: (comment.user as any).username || '',
                        avatar: (comment.user as any).avatar || '',
                        fullName: (comment.user as any).fullName || '',
                        followers: (comment.user as any).followers || [],
                        following: (comment.user as any).following || [],
                      }
                    : {
                        _id: String(comment.user),
                        username: 'User',
                        avatar: '',
                        fullName: '',
                        followers: [],
                        following: [],
                      },
              })) || [],
          }}
          onPublish={handleUpdatePost}
          onClose={() => {
            setIsEditModalOpen(false);
            setPostToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default FeedPage;