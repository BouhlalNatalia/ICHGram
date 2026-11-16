import React from 'react';
import { Heart } from 'lucide-react';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  isLiked: boolean;
  likesCount?: number;
  onLike: () => void;
  size?: number;
  showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  likesCount,
  onLike,
  size = 24,
  showCount = true,
}) => {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onLike();
  };

  return (
    <div className={styles.likeWrapper} onClick={handleLike}>
      <Heart
        size={size}
      
        fill={isLiked ? "#ed4956" : "transparent"}
 
        color={isLiked ? "#ed4956" : "currentColor"}
        className={`${styles.icon} ${isLiked ? styles.isLiked : ''}`}
      />
      {showCount && likesCount !== undefined && (
        <span className={styles.count}>{likesCount}</span>
      )}
    </div>
  );
};

export default LikeButton;