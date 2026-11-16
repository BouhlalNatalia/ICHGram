import { useCallback, useMemo, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hook/storeHooks';
import { useNavigate, useParams } from 'react-router-dom';

import {
    fetchProfileData,
    toggleFollowUser,
    clearProfile
} from '../model/profileSlice';
import { updateFollowStatusInNotifications } from '../../feed/model/notificationSlice';
import { toggleLikeThunk } from '../../feed/model/feedSlice';
import { logout } from '../../auth/model/authSlice';
import type { IUser } from '../../../types';
import type { IPost } from '../../feed/types/feed.types';

export interface IUseProfile {
    profileUser: IUser | null;
    profilePosts: IPost[];
    isLoading: boolean;
    isInitializing: boolean;
  error: string | null;
    currentUser: IUser | null;
    isOwnProfile: boolean;
    isFollowing: boolean;
    selectedPost: IPost | null;
    isEditModalOpen: boolean;
    setIsEditModalOpen: (val: boolean) => void;
    setSelectedPostId: (val: string | null) => void;
    handleFollow: () => Promise<void>;
    handleLike: (postId: string) => Promise<void>;
    handleLogout: () => void;
    refreshProfile: () => void;
}

export const useProfile = (): IUseProfile => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { username: identifier } = useParams<{ username: string }>();

    const { profileUser, profilePosts, isLoading, error } = useAppSelector((state) => state.profile);
    const { user: currentUser } = useAppSelector((state) => state.auth);

    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initProfile = async () => {
            try {
                if (identifier) {
                    await dispatch(fetchProfileData(identifier)).unwrap();
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setIsInitializing(false);
            }
        };
        initProfile();
        return () => { dispatch(clearProfile()); };
    }, [dispatch, identifier]);

    const isOwnProfile = useMemo(() => currentUser?._id === profileUser?._id, [currentUser, profileUser]);

const isFollowing = useMemo(() => {
    if (!profileUser || !currentUser?._id) return false;
    return profileUser.followers.includes(currentUser._id);
}, [profileUser, currentUser]);

    const selectedPost = useMemo(() => profilePosts.find(p => p._id === selectedPostId) || null, [profilePosts, selectedPostId]);

    const refreshProfile = useCallback(() => {
        if (identifier) dispatch(fetchProfileData(identifier));
    }, [dispatch, identifier]);

const handleFollow = useCallback(async () => {
        if (!profileUser?._id || !currentUser?._id) return;
        dispatch(toggleFollowUser({ 
            userId: profileUser._id, 
            currentUserId: currentUser._id 
        }));
      
        dispatch(updateFollowStatusInNotifications({ 
            userId: profileUser._id, 
            currentUserId: currentUser._id, 
            isFollowing: !isFollowing 
        }));
        
    }, [dispatch, profileUser, currentUser, isFollowing]);

    const handleLike = useCallback(async (postId: string) => {
        await dispatch(toggleLikeThunk(postId)).unwrap();
    }, [dispatch]);

    const handleLogout = useCallback(() => {
        dispatch(logout());
        dispatch(clearProfile());
        navigate('/login');
    }, [dispatch, navigate]);

    return {
        profileUser,
        profilePosts,
        isLoading,
        isInitializing,
        error,
        currentUser,
        isOwnProfile,
        isFollowing,
        selectedPost,
        isEditModalOpen,
        setIsEditModalOpen,
        setSelectedPostId,
        handleFollow,
        handleLike,
        handleLogout,
        refreshProfile
    };
};