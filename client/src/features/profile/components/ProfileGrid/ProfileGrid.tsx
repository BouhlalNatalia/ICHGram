import React from 'react';
import styles from './ProfileGrid.module.css';
import type { IPost } from '../../../feed/types/feed.types';
import { getImageUrl } from '../../../../config';

interface ProfileGridProps {
  posts: IPost[];
  onSelect: (post: IPost) => void;
}

const ProfileGrid: React.FC<ProfileGridProps> = ({ posts, onSelect }) => {
  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <div key={post._id} onClick={() => onSelect(post)} className={styles.item}>
          <img 
            src={getImageUrl(post.image)} 
            alt={post.description || 'User post'} 
            className={styles.image} 
          />
        </div>
      ))}
    </div>
  );
};

export default ProfileGrid;