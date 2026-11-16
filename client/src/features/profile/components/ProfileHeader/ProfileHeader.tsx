import React, { useState } from 'react';
import { LogOut, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../../hook/storeHooks';
import { toggleFollowInAuth } from '../../../auth/model/authSlice'; 
import styles from './ProfileHeader.module.css';
import type { IUser } from '../../../../types/index';
import { getImageUrl } from '../../../../config';

interface Props {
  user: IUser;
  postsCount: number;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onLogout?: () => void;
  onEdit?: () => void;
}

const ProfileHeader: React.FC<Props> = ({ 
  user, 
  postsCount, 
  isOwnProfile, 
  isFollowing, 
  onFollow, 
  onLogout, 
  onEdit 
}) => {
    
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  const [isBioExpanded, setIsBioExpanded] = useState(false);


  const handleFollowClick = () => {
    if (user?._id) {
      onFollow();
      dispatch(toggleFollowInAuth(user._id));
    }
  };


  const handleMessageClick = () => {
    if (user?._id) {
      navigate(`/messages?userId=${user._id}`);
    }
  };

  const getCount = (data: (string | IUser)[] | undefined | null): number => {
    return Array.isArray(data) ? data.length : 0;
  };

  const rawWebsite = 
    user.website || 
    (user as any).websIte || 
    (user as any).link || 
    (user as any).site;

  const userWebsite = typeof rawWebsite === 'string' ? rawWebsite.trim() : '';
  const userBio = user.bio || '';
  const BIO_LIMIT = 80; 
  const isLongBio = userBio.length > BIO_LIMIT;

  const displayedBio = isLongBio && !isBioExpanded 
    ? `${userBio.slice(0, BIO_LIMIT)}...` 
    : userBio;

  return (
    <header className={styles.header}>
      <div className={styles.avatarColumn}>
        <div className={styles.storyCircle}>
          <img src={getImageUrl(user.avatar)} className={styles.avatar} alt="profile" />
        </div>
      </div>

      <div className={styles.infoColumn}>
        <div className={styles.topRow}>
          <h2 className={styles.username}>{user.username}</h2>
          <div className={styles.actions}>
            {isOwnProfile ? (
              <>
                <button className={styles.secondaryBtn} onClick={onEdit}>Edit profile</button>
                <button className={styles.logoutBtn} onClick={onLogout}><LogOut size={20} /></button>
              </>
            ) : (
              <>
                <button 
                  className={isFollowing ? styles.secondaryBtn : styles.primaryBtn} 
                  onClick={handleFollowClick}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className={styles.secondaryBtn} onClick={handleMessageClick}>Message</button>
              </>
            )}
          </div>
        </div>

        <div className={styles.statsRow}>
          <span><strong>{postsCount}</strong> posts</span>
          <span><strong>{getCount(user.followers)}</strong> followers</span>
          <span><strong>{getCount(user.following)}</strong> following</span>
        </div>

        <div className={styles.bioContainer}>
          {userBio && (
            <p className={styles.bioText}>
              {displayedBio}
              {isLongBio && (
                <span 
                  className={styles.moreText} 
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                >
                  {isBioExpanded ? ' less' : ' more'}
                </span>
              )}
            </p>
          )}
          
          {userWebsite && (
            <a 
              href={userWebsite.startsWith('http') ? userWebsite : `https://${userWebsite}`} 
              className={styles.websiteLink} 
              target="_blank" 
              rel="noreferrer"
            >
              <LinkIcon size={14} /> {userWebsite.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;