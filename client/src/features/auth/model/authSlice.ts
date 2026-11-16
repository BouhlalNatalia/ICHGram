import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '../../../types/index';
import { toggleFollowUser } from '../../profile/model/profileSlice';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuth: boolean;
}

const getSafeUser = (): IUser | null => {
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser || savedUser === 'undefined' || savedUser === 'null') {
      return null;
    }
    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Ошибка парсинга пользователя из localStorage:", error);
    return null;
  }
};

const initialState: AuthState = {
  user: getSafeUser(),
  token: localStorage.getItem('token'),
  isAuth: !!localStorage.getItem('token') && localStorage.getItem('token') !== 'undefined',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
      const { user, token } = action.payload;

      if (user && token) {
        const fullUser = { 
            ...user, 
            avatar: user.avatar || '' 
        };

        state.user = fullUser;
        state.token = token;
        state.isAuth = true;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(fullUser));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.clear(); 
    },
    // --- РЕДЬЮСЕР ДЛЯ МГНОВЕННОЙ ПОДПИСКИ / ОТПИСКИ ---
    toggleFollowInAuth: (state, action: PayloadAction<string>) => {
      if (state.user) {
        const targetUserId = action.payload; 


        const followingIds = (state.user.following || []).map((f: any) => 
          typeof f === 'object' && f !== null ? String(f._id) : String(f)
        );

        if (followingIds.includes(targetUserId)) {
      
          state.user.following = (state.user.following || []).filter((f: any) => {
            const id = typeof f === 'object' && f !== null ? f._id : f;
            return String(id) !== targetUserId;
          });
        } else {
         
          if (!state.user.following) state.user.following = [];
          state.user.following.push(targetUserId as any);
        }

        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
 
  extraReducers: (builder) => {
    builder.addCase(toggleFollowUser.fulfilled, (state, action) => {
      if (!state.user) return;

      const { userId, isFollowing } = action.payload;
      const currentFollowing = state.user.following ? [...state.user.following] : [];

      const isFollowingIdx = currentFollowing.findIndex(
        (f: any) => String(f._id || f) === String(userId)
      );

      if (isFollowing) {
        if (isFollowingIdx === -1) {
          currentFollowing.push(userId as any);
        }
      } else {
        if (isFollowingIdx > -1) {
          currentFollowing.splice(isFollowingIdx, 1);
        }
      }

     
      state.user.following = currentFollowing;
      

      localStorage.setItem('user', JSON.stringify(state.user));
    });
  }
});


export const { setCredentials, logout, toggleFollowInAuth } = authSlice.actions;
export default authSlice.reducer;