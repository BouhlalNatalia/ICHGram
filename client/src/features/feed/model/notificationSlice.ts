import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios'; 
import api from '../../../services/api';
import type { INotification } from '../../../types/index';

import { toggleFollowUser } from '../../profile/model/profileSlice';

interface NotificationState {
    items: INotification[];
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    items: [],
    isLoading: false,
    error: null,
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/notifications');
            return data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки');
            }
            return rejectWithValue('Произошла непредвиденная ошибка');
        }
    }
);

export const markAllAsReadThunk = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.put('/notifications/mark-as-read');
            return data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении');
            }
            return rejectWithValue('Произошла непредвиденная ошибка');
        }
    }
);


export const deleteNotificationThunk = createAsyncThunk(
    'notifications/deleteOne',
    async (notifId: string, { rejectWithValue }) => {
        try {
           
            await api.delete(`/notifications/${notifId}`);
            return notifId; 
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Ошибка при удалении уведомления');
            }
            return rejectWithValue('Произошла непредвиденная ошибка');
        }
    }
);

export const deleteAllNotificationsThunk = createAsyncThunk(
    'notifications/deleteAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.delete('/notifications/clear-all');
            return data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Ошибка при удалении');
            }
            return rejectWithValue('Произошла непредвиденная ошибка');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.items = [];
        },
        updateFollowStatusInNotifications: (state, action: PayloadAction<{ userId: string; currentUserId: string; isFollowing: boolean }>) => {
            const { userId, currentUserId, isFollowing } = action.payload;

            state.items.forEach(notif => {
                if (notif.fromUser && String(notif.fromUser._id) === String(userId)) {
                    const followers = notif.fromUser.followers || [];
                    notif.fromUser.followers = isFollowing
                        ? Array.from(new Set([...followers, currentUserId]))
                        : followers.filter(id => String(id) !== String(currentUserId));
                }
            });
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<INotification[]>) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(markAllAsReadThunk.fulfilled, (state) => {
                state.isLoading = false;
                state.items = state.items.map(notif => ({
                    ...notif,
                    read: true 
                }));
            })
        
            .addCase(deleteNotificationThunk.fulfilled, (state, action: PayloadAction<string>) => {
            
                state.items = state.items.filter(notif => notif._id !== action.payload);
            })
            .addCase(deleteAllNotificationsThunk.fulfilled, (state) => {
                state.items = [];
            })
            .addCase(toggleFollowUser.fulfilled, (state, action) => {
                const { userId, isFollowing } = action.payload;
               
                state.items.forEach(notif => {
                    if (notif.fromUser && String(notif.fromUser._id) === String(userId)) {
                        const followers = notif.fromUser.followers || [];
                        notif.fromUser.followers = isFollowing
                            ? Array.from(new Set([...followers, 'current_user_placeholder']))
                            : followers.filter(id => String(id) !== 'current_user_placeholder');
                    }
                });
            });
    },
});

export const { clearNotifications, updateFollowStatusInNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;