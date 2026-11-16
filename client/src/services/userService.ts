import api from './api';
import type { IUser } from '../types/index';

export interface IStoryUser {
  _id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  lastPostAt: string | null;
  hasNewPost: boolean;
}

export const userService = {
  // Получение профиля по ID
  async getUserProfile(userId: string): Promise<IUser> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Получение профиля по Username 
  async getUserByUsername(username: string): Promise<IUser> {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  },

  // Обновление профиля
  async updateUserProfile(formData: FormData): Promise<IUser> {
    const response = await api.put('/users/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Подписка/Отписка 
  async toggleFollow(userId: string): Promise<IUser> {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },
  // Кружочки сверху: на кого подписана + есть ли свежий пост (за 24 часа)
  async getFollowingActivity(): Promise<IStoryUser[]> {
    const response = await api.get('/users/following-activity');
    return response.data;
  },
  
  // Поиск пользователей
  async searchUsers(query: string): Promise<IUser[]> {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  }
};