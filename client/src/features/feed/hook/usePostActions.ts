import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../hook/storeHooks';
import { deletePostThunk, addCommentThunk, toggleLikeCommentThunk, updatePostThunk } from '../model/feedSlice';
import type { IPost } from '../types/feed.types';


export const usePostActions = (post: IPost | null, onCloseModal?: () => void) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const commentInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (post?._id && onCloseModal) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  }, [post?._id, onCloseModal]);

  const handlePostComment = useCallback(async () => {
    if (!post?._id || !commentText.trim()) return;
    try {
      await dispatch(addCommentThunk({ postId: post._id, text: commentText })).unwrap();
      setCommentText('');
      setShowEmojiPicker(false);
    } catch (e) { 
      console.error("Comment failed:", e); 
    }
  }, [post, commentText, dispatch]);

  const addEmoji = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (window.confirm("Delete post?")) {
      try {
        await dispatch(deletePostThunk(post._id)).unwrap();
        setIsMenuOpen(false);
        if (onCloseModal) onCloseModal();
      } catch (e) {
        console.error("Delete failed:", e);
      }
    }
  };

  const handleCopyLink = useCallback(() => {
    if (!post?._id) return;
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert("Link copied to clipboard!"); 
        setIsMenuOpen(false);
      })
      .catch(err => console.error("Failed to copy:", err));
  }, [post]);

  const handleGoToPost = useCallback(() => {
    if (!post?._id) return;
    navigate(`/post/${post._id}`);
    setIsMenuOpen(false);
    if (onCloseModal) onCloseModal();
  }, [post, navigate, onCloseModal]);

  const handleToggleLikeComment = useCallback(async (commentId: string) => {
    if (!post?._id) return;
    try {
      await dispatch(toggleLikeCommentThunk({ postId: post._id, commentId })).unwrap();
    } catch (e) {
      console.error("Failed to toggle comment like:", e);
    }
  }, [post, dispatch]);

  
  const handleUpdatePost = useCallback(async (data: { file: File | null; caption: string }) => {
    if (!post?._id) return;
    try {
      const formData = new FormData();
      formData.append('description', data.caption);
      if (data.file) {
        formData.append('image', data.file);
      }
      const updatedPost = await dispatch(updatePostThunk({ postId: post._id, formData })).unwrap();
      
   
      if (onCloseModal) {
        onCloseModal();
      }
      
      return updatedPost;
    } catch (e) {
      console.error("Failed to update post:", e);
    }
  }, [post, dispatch, onCloseModal]);

  return { 
    commentInputRef, 
    isMenuOpen, 
    setIsMenuOpen, 
    showEmojiPicker, 
    setShowEmojiPicker, 
    commentText, 
    setCommentText, 
    handlePostComment, 
    addEmoji, 
    handleDeletePost,
    handleCopyLink, 
    handleGoToPost,
    handleToggleLikeComment,
    handleUpdatePost 
  };
};