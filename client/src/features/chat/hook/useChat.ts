import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chatService } from '../../../services/chatService';
import {
  setActiveChat,
  addMessage,
  fetchChats,
  fetchMessages,
  markChatAsRead,
  accessChatThunk 
} from '../model/chatSlice';
import type { RootState, AppDispatch } from '../../../store/index';

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { chats, messages, activeChatId, loading } = useSelector((state: RootState) => state.chat);

  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  
  useEffect(() => {
    if (activeChatId) {
      dispatch(fetchMessages(activeChatId.toString()));
   
      chatService.markAsRead(activeChatId.toString());
    }
  }, [activeChatId, dispatch]);


  const startChatWithUser = useCallback(async (targetUserId: string) => {
    try {

      const resultAction = await dispatch(accessChatThunk(targetUserId)).unwrap();
      

      await dispatch(fetchChats());
      
      return resultAction;
    } catch (error: unknown) {
      console.error("Ошибка при создании чата в useChat:", error);
    }
  }, [dispatch]);


  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !activeChatId || !user) return;

    const chatIdString = activeChatId.toString();

    try {
      // Сервер сохраняет сообщение и сам отправляет его получателю через Socket.io
      const savedMsg = await chatService.sendMessage(chatIdString, text);
      dispatch(addMessage(savedMsg));
    } catch (error: unknown) {
      console.error("Ошибка при отправке сообщения:", error);
    }
  }, [activeChatId, user, dispatch]);


  const setActiveChatId = useCallback(async (id: string | number) => {
    const idStr = id.toString();
    dispatch(setActiveChat(idStr));
    dispatch(markChatAsRead(idStr));

    try {
      await chatService.markAsRead(idStr);
    } catch (e) {
      console.error("Failed to mark messages as read", e);
    }
  }, [dispatch]);


  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      
      if (String(activeChatIdRef.current) === String(chatId)) {
        dispatch(setActiveChat(null));
      }
      
      await dispatch(fetchChats());
    } catch (error: unknown) {
      console.error("Ошибка при удалении чата в useChat:", error);
      throw error;
    }
  }, [dispatch]);

  return {
    activeChatId,
    setActiveChatId,
    messages,
    chats,
    sendMessage,
    startChatWithUser,
    deleteChat,
    loading
  };
};