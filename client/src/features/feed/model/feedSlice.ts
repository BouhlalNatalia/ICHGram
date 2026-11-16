import { createSlice, createAsyncThunk, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import { postService } from '../../../services/postService';
import type { IPost } from '../types/feed.types';

interface FeedState {
  posts: IPost[];
  currentPost: IPost | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FeedState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
};

// ---------------- THUNKS ----------------

export const fetchFeedPosts = createAsyncThunk<IPost[]>(
  'feed/fetchPosts',
  async () => {
    return await postService.getPosts();
  }
);

export const toggleLikeThunk = createAsyncThunk<IPost, string>(
  'feed/toggleLike',
  async (postId) => {
    return await postService.toggleLike(postId);
  }
);

export const deletePostThunk = createAsyncThunk<string, string>(
  'feed/deletePost',
  async (postId) => {
    await postService.deletePost(postId);
    return postId;
  }
);

export const createPostThunk = createAsyncThunk<IPost, FormData>(
  'feed/createPost',
  async (formData) => {
    return await postService.createPost(formData);
  }
);

export const updatePostThunk = createAsyncThunk<
  IPost,
  { postId: string; formData: FormData }
>('feed/updatePost', async ({ postId, formData }) => {
  return await postService.updatePost(postId, formData);
});

export const addCommentThunk = createAsyncThunk<
  IPost,
  { postId: string; text: string }
>('feed/addComment', async ({ postId, text }) => {
  return await postService.addComment(postId, text);
});

export const toggleLikeCommentThunk = createAsyncThunk<
  IPost,
  { postId: string; commentId: string }
>('feed/toggleLikeComment', async ({ postId, commentId }) => {
  return await postService.toggleLikeComment(postId, commentId);
});

// ---------------- SLICE ----------------

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setCurrentPost: (state, action: PayloadAction<IPost | null>) => {
      state.currentPost = action.payload;
    },

    updatePostFromSocket: (state, action: PayloadAction<IPost>) => {
      state.posts = state.posts.map(p =>
        p._id === action.payload._id ? action.payload : p
      );

      if (state.currentPost?._id === action.payload._id) {
        state.currentPost = action.payload;
      }
    },

    clearFeedState: (state) => {
      state.posts = [];
      state.currentPost = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      })

      .addCase(toggleLikeThunk.fulfilled, (state, action) => {
        state.posts = state.posts.map(p =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
        if (state.currentPost?._id === action.payload) state.currentPost = null;
      })

      .addCase(createPostThunk.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })

      .addCase(updatePostThunk.fulfilled, (state, action) => {
        state.posts = state.posts.map(p =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      .addCase(addCommentThunk.fulfilled, (state, action) => {
        state.posts = state.posts.map(p =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      .addCase(toggleLikeCommentThunk.fulfilled, (state, action) => {
        state.posts = state.posts.map(p =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      // Открытая модалка поста читает state.feed.currentPost — держим его в актуальном состоянии
      .addMatcher(
        isAnyOf(
          toggleLikeThunk.fulfilled,
          addCommentThunk.fulfilled,
          toggleLikeCommentThunk.fulfilled,
          updatePostThunk.fulfilled
        ),
        (state, action) => {
          if (state.currentPost?._id === action.payload._id) {
            state.currentPost = action.payload;
          }
        }
      );
  },
});

export const {
  setCurrentPost,
  updatePostFromSocket,
  clearFeedState,
} = feedSlice.actions;

export default feedSlice.reducer;