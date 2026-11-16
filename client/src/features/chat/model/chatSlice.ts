import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { chatService } from '../../../services/chatService';
import type { IChat, IMessage } from '../types/chat.types';

export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  return await chatService.getChats();
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId: string | number) => {
  return await chatService.getMessages(chatId);
});

export const accessChatThunk = createAsyncThunk('chat/accessChat', async (userId: string) => {
  return await chatService.accessChat(userId);
});

interface ChatState {
  chats: IChat[];
  messages: IMessage[];
  activeChatId: string | number | null;
  loading: boolean;
}

const initialState: ChatState = {
  chats: [],
  messages: [],
  activeChatId: null,
  loading: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<string | number | null>) => {
      state.activeChatId = action.payload;
      state.messages = [];
    },

    markChatAsRead: (state, action: PayloadAction<string | number>) => {
      const chatIndex = state.chats.findIndex(c => String(c._id) === String(action.payload));
      if (chatIndex !== -1) {
        state.chats[chatIndex].unreadCount = 0;
      }
    },

    addMessage: (state, action: PayloadAction<IMessage>) => {
      const newMessage = action.payload;
      
      let incomingChatId: string | null = null;
      if (newMessage.chat) {
        incomingChatId = typeof newMessage.chat === 'object' 
          ? String(newMessage.chat._id) 
          : String(newMessage.chat);
      }

      const sActiveChatId = state.activeChatId ? String(state.activeChatId) : null;

      if (incomingChatId === sActiveChatId) {
        const isDuplicate = state.messages.some(m => String(m._id) === String(newMessage._id));
        if (!isDuplicate) {
          state.messages.push(newMessage);
        }
      }

      const chatIndex = state.chats.findIndex(c => String(c._id) === incomingChatId);
      
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = newMessage.text;
        
        if (incomingChatId !== sActiveChatId) {
          state.chats[chatIndex].unreadCount = (state.chats[chatIndex].unreadCount || 0) + 1;
        }

        const [targetChat] = state.chats.splice(chatIndex, 1);
        state.chats.unshift(targetChat);
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload; 
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(accessChatThunk.fulfilled, (state, action) => {
        const incomingChat = action.payload;
        if (!incomingChat) return;

        state.activeChatId = incomingChat._id;

        const chatExists = state.chats.some(chat => String(chat._id) === String(incomingChat._id));
        
        if (!chatExists) {
          state.chats.unshift(incomingChat);
        }
      });
  },
});

export const { setActiveChat, addMessage, setLoading, markChatAsRead } = chatSlice.actions;
export default chatSlice.reducer;