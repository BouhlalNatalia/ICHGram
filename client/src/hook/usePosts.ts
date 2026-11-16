import { useState, useEffect, useCallback, useMemo } from 'react';
import { postService } from '../services/postService';
import type { IPost } from '../features/feed/types/feed.types';
import type { IUser } from '../types/';
import { useAppDispatch } from './storeHooks';
import { fetchProfileData } from '../features/profile/model/profileSlice'; 


export const usePosts = (user: IUser | null) => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await postService.getExplorePosts();
      setPosts(data);
    } catch (err) {
      setError('Не удалось загрузить посты');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const shuffle = (array: IPost[]): IPost[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const explorePosts = useMemo(() => {
    if (!user) return posts;
    const otherUsersPosts = posts.filter((post) => {
      const authorId = typeof post.user === 'object' ? post.user?._id : post.user;
      return authorId !== user._id;
    });
    return shuffle(otherUsersPosts);
  }, [posts, user]);

  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const isLiked = post.likes.some((like) => {
            const likeId = typeof like === 'object' && like !== null ? like._id : like;
            return String(likeId) === String(user._id);
          });
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter((like) => {
                  const likeId = typeof like === 'object' && null ? like._id : like;
                  return String(likeId) !== String(user._id);
                })
              : [...post.likes, user._id],
          };
        }
        return post;
      })
    );
    try {
      await postService.toggleLike(postId);
    } catch (err) {
      fetchPosts();
    }
  };

  const handleToggleFollow = async (targetUserId: string) => {
    if (!user) return;
    try {
    
      await postService.toggleFollow(targetUserId);
      
         dispatch(fetchProfileData(targetUserId));
      
    

    } catch (err) {
      console.error("Ошибка при изменении подписки на карточке поста:", err);
    }
  };

  const handleAddNewPost = async (data: { file: File; caption: string }) => {
    if (!user) return;
    try {
      const formData = new FormData();
      formData.append('image', data.file);
      formData.append('description', data.caption);
      const newPost = await postService.createPost(formData);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      throw err;
    }
  };

  return {
    posts,
    explorePosts,
    isLoading,
    error,
    handleToggleLike,
    handleToggleFollow, 
    handleAddNewPost,
    refreshPosts: fetchPosts
  };
};