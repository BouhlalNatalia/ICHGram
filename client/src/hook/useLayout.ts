import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch } from './storeHooks';
import { setCurrentPost, updatePostFromSocket, updatePostThunk } from '../features/feed/model/feedSlice';
import { fetchNotifications } from '../features/feed/model/notificationSlice';
import { chatService } from '../services/chatService';
import { addMessage, fetchChats } from '../features/chat/model/chatSlice';
import type { IUser } from '../types/index';
import type { IPost } from '../features/feed/types/feed.types';

type PanelType = 'search' | 'notifications' | 'messages' | null;

export const useLayout = (
  user: IUser | null,
  onAddNewPost: (data: { file: File | null; caption: string }) => Promise<IPost>
) => {
  const dispatch = useAppDispatch();

  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<IPost | null>(null);

  // Socket.io: сообщения, обновления постов (лайки/комментарии) и уведомления в реальном времени
  useEffect(() => {
    if (!user?._id) return;

    chatService.connect();
    dispatch(fetchChats());

    chatService.onMessage((msg) => dispatch(addMessage(msg)));
    chatService.onPostUpdated((post) => dispatch(updatePostFromSocket(post)));
    chatService.onNotification(() => dispatch(fetchNotifications()));

    return () => {
      chatService.off();
      chatService.disconnect();
    };
  }, [user?._id, dispatch]);

  const togglePanel = useCallback(
    (panel: PanelType) => {
      dispatch(setCurrentPost(null));
      setActivePanel((prev) => (prev === panel ? null : panel));
    },
    [dispatch]
  );

  const closeAll = useCallback(() => {
    dispatch(setCurrentPost(null));
    setActivePanel(null);
    setIsCreateModalOpen(false);
    setEditingPost(null);
  }, [dispatch]);

  const openCreateModal = useCallback(() => {
    dispatch(setCurrentPost(null));
    setIsCreateModalOpen(true);
  }, [dispatch]);

  // Публикация (или сохранение правок) из модального окна «Create new post»
  const handlePublish = useCallback(
    async (data: { file: File | null; caption: string }): Promise<IPost | undefined> => {
      if (editingPost) {
        const formData = new FormData();
        formData.append('description', data.caption);
        if (data.file) formData.append('image', data.file);
        return await dispatch(updatePostThunk({ postId: editingPost._id, formData })).unwrap();
      }
      return await onAddNewPost(data);
    },
    [editingPost, dispatch, onAddNewPost]
  );

  return {
    activePanel,
    isCreateModalOpen,
    editingPost,
    togglePanel,
    closeAll,
    openCreateModal,
    handlePublish,
    setIsCreateModalOpen,
    setEditingPost,
  };
};
