import type { IUser } from '../../../types';


export type { IUser };

export interface IComment {
  _id: string;
  text: string;
  user: IUser | string;
  post: string | { _id: string };
  createdAt: string;
  likes: string[];
}

export interface IPost {
  _id: string;
  user: IUser;
  image: string;
  description: string;
  likes: (string | { _id: string })[];
  comments: IComment[];
  createdAt: string;
  updatedAt: string;
}

export interface IFeedState {
  posts: IPost[];
  isLoading: boolean;
  error: string | null;
}