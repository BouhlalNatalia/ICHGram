export interface IUser {
  _id: string;
  username: string;
  fullName: string;
  avatar?: string;
  followers: string[]; 
  following: string[];
  bio?: string;      
  website?: string;
}

export interface IComment {
  _id: string;
  user: IUser;
  text: string;
  createdAt: string;
  likes: string[];
}

export interface IPost {
  _id: string;
  user: IUser;
  image: string;
  description?: string; 
  likes: string[];
  comments?: IComment[];
  createdAt: string;
}

export interface INotification {
    _id: string;
    type: 'like' | 'comment' | 'follow';
    fromUser: {
        _id: string;
        username: string;
        avatar: string;
        followers: string[]; 
        isFollowing?: boolean;
    };
    post?: {
        _id: string;
        image: string;
    };
    commentText?: string;
    createdAt: string;
    read: boolean;
}


export interface RegisterData {
  username: string;
  email: string;
  password?: string;
  fullName?: string; 
}


export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}


export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}


export interface AuthResponse {
  user: IUser;
  token: string;
}

export interface UpdateProfileData {
    username?: string;
    fullName?: string;
    bio?: string;
    website?: string;
    file?: File | null;
}