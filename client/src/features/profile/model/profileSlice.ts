import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios'; 
import { postService } from '../../../services/postService';
import { userService } from '../../../services/userService';
import {
  deletePostThunk,
  createPostThunk,
  toggleLikeThunk,
  addCommentThunk,
  updatePostThunk,
  updatePostFromSocket
} from '../../feed/model/feedSlice';
import type { IUser } from '../../../types/index';
import type { IPost } from '../../feed/types/feed.types';

interface ProfileState {
  profileUser: IUser | null;
  profilePosts: IPost[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profileUser: null,
  profilePosts: [],
  isLoading: false,
  error: null,
};

export const toggleFollowUser = createAsyncThunk<
  { userId: string; isFollowing: boolean; currentUserId?: string },
  { userId: string; currentUserId?: string },
  { rejectValue: string }
>(
  'profile/toggleFollow',
  async ({ userId, currentUserId }, { rejectWithValue }) => {
    try {
      const data = await postService.toggleFollow(userId);
      return { userId, isFollowing: data.isFollowing, currentUserId };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Ошибка подписки");
      }
      return rejectWithValue("Произошла неизвестная ошибка");
    }
  }
);

export const fetchProfileData = createAsyncThunk(
  'profile/fetchData',
  async (identifier: string, { rejectWithValue }) => {
    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(identifier);
      let user: IUser | null;

      if (isMongoId) {
        user = await userService.getUserProfile(identifier);
      } else {
        user = await userService.getUserByUsername(identifier);
      }

      if (!user) return rejectWithValue('User not found');

      const posts = await postService.getUserPosts(user._id);
      return { user, posts };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Не удалось загрузить профиль");
      }
      return rejectWithValue("Ошибка сети");
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profileUser = null;
      state.profilePosts = [];
      state.error = null;
      state.isLoading = false;
    },
    updateProfileFollowers: (state, action: PayloadAction<{ currentUserId: string; isFollowing: boolean }>) => {
      const { currentUserId, isFollowing } = action.payload;
      if (state.profileUser) {
        const followers = state.profileUser.followers || [];
        state.profileUser = {
          ...state.profileUser,
          followers: isFollowing
            ? Array.from(new Set([...followers, currentUserId]))
            : followers.filter(id => String(id) !== String(currentUserId))
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileUser = action.payload.user;
        state.profilePosts = action.payload.posts;
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.profileUser = null;
      })
      
   
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { userId, isFollowing, currentUserId } = action.payload;
        
        if (state.profileUser && String(state.profileUser._id) === String(userId)) {
          const followers = state.profileUser.followers || [];
          const myId = currentUserId || 'current_user_placeholder';
          
          state.profileUser.followers = isFollowing
            ? Array.from(new Set([...followers, myId]))
            : followers.filter(id => String(id) !== String(myId));
        }
      })
      
      .addCase(toggleLikeThunk.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        state.profilePosts = state.profilePosts.map(post => post._id === updatedPost._id ? updatedPost : post);
      })
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        state.profilePosts = state.profilePosts.map(post => post._id === updatedPost._id ? updatedPost : post);
      })
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        state.profilePosts = state.profilePosts.map(post => post._id === updatedPost._id ? updatedPost : post);
      })
      .addCase(updatePostFromSocket, (state, action) => {
        state.profilePosts = state.profilePosts.map(post => post._id === action.payload._id ? action.payload : post);
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.profilePosts = state.profilePosts.filter((post) => post._id !== action.payload);
      })
      .addCase(createPostThunk.fulfilled, (state, action) => {
        if (!state.profileUser) return;
        const authorId = typeof action.payload.user === 'object' && action.payload.user !== null ? action.payload.user._id : action.payload.user;
        if (String(state.profileUser._id) === String(authorId)) {
          state.profilePosts.unshift(action.payload);
        }
      });
  },
});

export const { clearProfile, updateProfileFollowers } = profileSlice.actions;
export default profileSlice.reducer;