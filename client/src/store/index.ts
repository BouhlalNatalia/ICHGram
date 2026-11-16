import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '../features/auth';
import feedReducer from '../features/feed/model/feedSlice';
import profileReducer from '../features/profile/model/profileSlice';
import chatReducer from '../features/chat/model/chatSlice';

import notificationReducer from '../features/feed/model/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    profile: profileReducer,
    chat: chatReducer,

    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;