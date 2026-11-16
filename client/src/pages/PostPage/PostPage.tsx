import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hook/storeHooks';
import { postService } from '../../services/postService';
import { toggleLikeThunk, setCurrentPost } from '../../features/feed/model/feedSlice'; 

import { toggleFollowUser } from '../../features/profile/model/profileSlice';
import PostCard from '../../features/feed/components/PostCard/PostCard';
import  PostModal  from '../../features/feed/components/PostModal/PostModal';
import ActionMenu from '../../components/ui/ActionMenu/ActionMenu'; 
import { usePostActions } from '../../features/feed/hook/usePostActions'; 
import type { IPost } from '../../features/feed/types/feed.types';
import styles from './PostPage.module.css';

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);

  const postFromStore = useAppSelector((state) =>
    state.feed.posts.find((p) => p._id === postId)
  );

  const [localPost, setLocalPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(!postFromStore);
  const [error, setError] = useState(false);

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false); 

  const currentPost = postFromStore || localPost;

  const { handleDeletePost, handleCopyLink, handleGoToPost } = usePostActions(currentPost, () => navigate('/'));

  useEffect(() => {
    if (!postFromStore && postId) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const data = await postService.getPostById(postId);
          setLocalPost(data);
          setError(false);
        } catch (err) {
          console.error("Ошибка загрузки поста:", err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [postId, postFromStore]);

  useEffect(() => {
    if (isCommentModalOpen && currentPost) {
      dispatch(setCurrentPost(currentPost));
    }
  }, [isCommentModalOpen, currentPost, dispatch]);

  const handleLike = async () => {
    if (currentPost) {
      await dispatch(toggleLikeThunk(currentPost._id));
      if (!postFromStore) {
        const updatedData = await postService.getPostById(currentPost._id);
        setLocalPost(updatedData);
      }
    }
  };


  const handleToggleFollow = async (targetUserId: string) => {
    if (!user?._id) return;

    try {
      await dispatch(toggleFollowUser({ 
        userId: targetUserId, 
        currentUserId: user._id 
      })).unwrap();

      if (!postFromStore) {
        const updatedData = await postService.getPostById(currentPost!._id);
        setLocalPost(updatedData);
      }
    } catch (err) {
      console.error("Ошибка при изменении подписки:", err);
    }
  };

  if (loading) return <div className={styles.center}>Загрузка поста...</div>;

  if (error || !currentPost) {
    return (
      <div className={styles.center}>
        <h2>Пост не найден</h2>
        <button onClick={() => navigate('/')}>Вернуться на главную</button>
      </div>
    );
  }

  const currentUserId = String(user?._id || (user as any)?.id || '');
  const isMyPost = String(currentPost.user?._id || (currentPost.user as any)?.id) === currentUserId;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <PostCard
          post={currentPost}
          currentUserId={currentUserId}
          isModal={false}
          onLike={handleLike}
          onFollow={handleToggleFollow}
          onDelete={() => navigate('/')}
          onEdit={(e?: any) => {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            setShowActionMenu(true); 
          }}
          onOpenModal={() => setIsCommentModalOpen(true)}
        />
      </div>

      {isCommentModalOpen && (
        <PostModal 
          isOpen={isCommentModalOpen} 
          onClose={() => setIsCommentModalOpen(false)} 
          post={currentPost}
          user={user}
          onLike={handleLike}
          onEdit={() => setShowActionMenu(true)}
        />
      )}

      {showActionMenu && (
        <ActionMenu 
          onClose={() => setShowActionMenu(false)}
          onCopyLink={handleCopyLink}
          onGoToPost={handleGoToPost}
          onDelete={isMyPost ? handleDeletePost : undefined}
          onEdit={isMyPost ? () => { setShowActionMenu(false); } : undefined}
        />
      )}
    </div>
  );
};

export default PostPage;