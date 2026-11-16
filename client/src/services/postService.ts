import api from './api'; 
import type { IPost } from '../features/feed/types/feed.types';
import type { IUser, IComment } from '../types/index';

export const postService = {
  async getPosts(): Promise<IPost[]> {
    const response = await api.get('/posts');
    return response.data;
  },

  async getExplorePosts(): Promise<IPost[]> {
    const response = await api.get('/posts/explore/all');
    return response.data;
  },

  async getPostById(postId: string): Promise<IPost> {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  async getUserPosts(userId: string): Promise<IPost[]> {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },

  async createPost(formData: FormData): Promise<IPost> {
    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updatePost(postId: string, formData: FormData): Promise<IPost> {
    const response = await api.put(`/posts/${postId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  },

  async toggleLike(postId: string): Promise<IPost> {
    const response = await api.post(`/likes/${postId}`);
    return response.data;
  },

 
  async addComment(postId: string, text: string): Promise<IPost> {
    const response = await api.post(`/posts/${postId}/comments`, { text });
    return response.data;
  },

  async getComments(postId: string): Promise<IComment[]> {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  async toggleLikeComment(postId: string, commentId: string): Promise<IPost> {
    const response = await api.post(`/likes/${postId}/comments/${commentId}`);
    return response.data;
  },

  async searchUsers(query: string): Promise<IUser[]> {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  },

  async getUserById(id: string): Promise<IUser | null> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async getUserByUsername(username: string): Promise<IUser | null> {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  },

   async toggleFollow(userId: string): Promise<{ message: string; isFollowing: boolean }> {
    const response = await api.post(`/users/${userId}/follow`);
    // Сообщаем интерфейсу, что сервер уже сохранил подписку/отписку
    window.dispatchEvent(new Event('following:changed'));
    return response.data;
  }
};