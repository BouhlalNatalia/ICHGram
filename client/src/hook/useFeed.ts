import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './storeHooks';

import {
  fetchFeedPosts,
  toggleLikeThunk,
  deletePostThunk,
  updatePostThunk,
  setCurrentPost
} from '../features/feed/model/feedSlice';

import { postService } from '../services/postService';
import { setCredentials } from '../features/auth/model/authSlice';
import type { IPost } from '../features/feed/types/feed.types';

export const useFeed = () => {
  const dispatch = useAppDispatch();

  const { posts, isLoading, currentPost } = useAppSelector(
    (state) => state.feed
  );

  const { user } = useAppSelector((state) => state.auth);
  const token = useAppSelector((state) => state.auth.token);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<IPost | null>(null);

  useEffect(() => {
    dispatch(fetchFeedPosts());
  }, [dispatch]);

  const handleLike = (postId: string) =>
    dispatch(toggleLikeThunk(postId));

  const handleDeletePost = (postId: string) =>
    dispatch(deletePostThunk(postId));

  const handleToggleFollow = async (targetUserId: string) => {
    if (!user || !token) return;

    const current = user.following ? [...user.following] : [];

    const exists = current.findIndex((id: any) =>
      String(id._id || id) === targetUserId
    );

    if (exists > -1) current.splice(exists, 1);
    else current.push(targetUserId);

    dispatch(
      setCredentials({
        token,
        user: { ...user, following: current }
      })
    );

    try {
      await postService.toggleFollow(targetUserId);
    } catch {
      dispatch(setCredentials({ token, user }));
    }
  };

  const handleOpenPostModal = (post: IPost) => {
    dispatch(setCurrentPost(post));
    localStorage.setItem('openedPostId', post._id);
  };

  const handleClosePostModal = () => {
    dispatch(setCurrentPost(null));
    localStorage.removeItem('openedPostId');
  };

  const handleOpenEditModal = useCallback((post: IPost) => {
    setPostToEdit(post);
    setIsEditModalOpen(true);
  }, []);

  const handleUpdatePost = async (data: {
    file: File | null;
    caption: string;
  }) => {
    if (!postToEdit) return;

    const formData = new FormData();
    formData.append('description', data.caption);
    if (data.file) formData.append('image', data.file);

    await dispatch(
      updatePostThunk({
        postId: postToEdit._id,
        formData
      })
    );

    setIsEditModalOpen(false);
  };

  return {
    posts,
    user,
    isLoading,
    activePost: currentPost,

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
    handleToggleFollow
  };
};