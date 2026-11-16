import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { useAppDispatch } from '../../hook/storeHooks';
import { updatePostThunk, setCurrentPost } from '../../features/feed/model/feedSlice'; 

import ProfileHeader from "../../features/profile/components/ProfileHeader/ProfileHeader";
import ProfileGrid from "../../features/profile/components/ProfileGrid/ProfileGrid";
import  PostModal  from '../../features/feed/components/PostModal/PostModal';
import CreatePostModal from "../../components/CreatePostModal/CreatePostModal";

import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const {
    profileUser,
    profilePosts,
    isLoading,
    isInitializing, 
    currentUser,
    selectedPost,
    isEditModalOpen,
    setIsEditModalOpen,
    setSelectedPostId,
    isOwnProfile,
    isFollowing,
    handleFollow,
    handleLogout,
    refreshProfile
  } = useProfile();

  const handleUpdatePost = async (data: { file: File | null; caption: string }) => {
    if (!selectedPost) return;

    try {
      const formData = new FormData();
      formData.append('description', data.caption); 
      if (data.file) formData.append('image', data.file);

      await dispatch(updatePostThunk({ 
        postId: selectedPost._id, 
        formData 
      })).unwrap();

      setIsEditModalOpen(false);
      setSelectedPostId(null);
      localStorage.removeItem('openedPostId');
      dispatch(setCurrentPost(null));
      refreshProfile(); 
    } catch (error) {
      console.error("Failed to update post in profile:", error);
    }
  };

  if (isInitializing) return null;

  if (isLoading) return <div className={styles.loader}>Loading...</div>;
  if (!profileUser) return <div className={styles.notFound}>User not found</div>;

  return (
    <div className={styles.container}>
      <ProfileHeader
        user={profileUser}
        postsCount={profilePosts.length}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onLogout={handleLogout}
        onEdit={() => navigate('/accounts/edit')}
      />

      <ProfileGrid 
        posts={profilePosts} 
        onSelect={(post) => {
          setSelectedPostId(post._id);
          localStorage.setItem('openedPostId', post._id);
          dispatch(setCurrentPost(post)); 
        }} 
      />

      {selectedPost && !isEditModalOpen && (
        <PostModal
          isOpen={true}
          onClose={() => {
            setSelectedPostId(null);
            localStorage.removeItem('openedPostId');
            dispatch(setCurrentPost(null)); 
          }}
        />
      )}

      {isEditModalOpen && selectedPost && (
        <CreatePostModal
          user={currentUser!}
          initialData={{
            ...selectedPost,
            likes: selectedPost.likes?.map(like => typeof like === 'object' && like !== null ? like._id : String(like)) || [],
            comments: selectedPost.comments?.map(comment => ({
              ...comment,
              user: typeof comment.user === 'object' && comment.user !== null ? (comment.user as any) : { _id: String(comment.user), username: 'User' }
            })) || []
          }}
          onPublish={handleUpdatePost} 
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPostId(null);
            localStorage.removeItem('openedPostId');
            dispatch(setCurrentPost(null));
            refreshProfile();
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;