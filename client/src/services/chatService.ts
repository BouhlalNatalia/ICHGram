
import api from './api';
import { io, Socket } from 'socket.io-client';
import type { IChat, IMessage } from '../features/chat/types/chat.types';
import type { IPost } from '../features/feed/types/feed.types';

import { SERVER_URL } from '../config';

const SOCKET_URL = SERVER_URL;

class ChatService {
  private socket: Socket | null = null;

  async getChats(): Promise<IChat[]> {
    const response = await api.get<IChat[]>('/chats');
    return response.data;
  }

  async accessChat(userId: string): Promise<IChat> {
    const response = await api.post<IChat>('/chats', { userId });
    return response.data;
  }

  async getMessages(chatId: string | number): Promise<IMessage[]> {
    const response = await api.get<IMessage[]>(`/messages/${chatId}`);
    return response.data;
  }

  async sendMessage(
    chatId: string | number,
    text: string
  ): Promise<IMessage> {
    const response = await api.post<IMessage>('/messages', {
      chatId,
      text,
    });
    return response.data;
  }

  async markAsRead(chatId: string | number): Promise<void> {
    await api.patch(`/chats/read/${chatId}`);
  }

  async deleteChat(chatId: string | number): Promise<void> {
    await api.delete(`/chats/${chatId}`);
  }

  connect(): void {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  onMessage(callback: (msg: IMessage) => void): void {
    if (!this.socket) return;

    this.socket.off('receiveMessage');
    this.socket.on('receiveMessage', (data: IMessage) => {
      const normalizedMessage: IMessage = {
        ...data,
        chat: data.chat || '',
      };

      callback(normalizedMessage);
    });
  }

  onPostUpdated(callback: (updatedPost: IPost) => void): void {
    if (!this.socket) {
      console.warn(
        '⚠️ [SOCKET] Попытка подписаться на postUpdated до инициализации сокета'
      );
      return;
    }

    this.socket.off('postUpdated');
    this.socket.on('postUpdated', (updatedPost: IPost) => {
      callback(updatedPost);
    });
  }

  onNotification(callback: () => void): void {
    if (!this.socket) return;

    this.socket.off('notification');
    this.socket.on('notification', () => callback());
  }

  off(): void {
    if (this.socket) {
      this.socket.off('receiveMessage');
      this.socket.off('postUpdated');
      this.socket.off('notification');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const chatService = new ChatService();
