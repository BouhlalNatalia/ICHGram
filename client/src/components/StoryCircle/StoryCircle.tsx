
import React, { useState } from 'react';
import styles from './StoryCircle.module.css';
import { getImageUrl, DEFAULT_AVATAR } from '../../config';

interface StoryCircleProps {
  username: string;
  avatarUrl: string;
  isMe?: boolean;
  hasStory?: boolean;
  onClick?: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({
  username,
  avatarUrl,
  isMe = false,
  hasStory = true,
  onClick
}) => {
  const [imgError, setImgError] = useState(false);

  const finalSrc = imgError ? DEFAULT_AVATAR : getImageUrl(avatarUrl);

  return (
    <div
      className={styles.storyContainer}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={`${styles.avatarWrapper} ${hasStory ? styles.activeGradient : styles.viewed}`}>
        <div className={styles.whiteBorder}>
          <img
            key={avatarUrl}
            src={finalSrc}
            alt={username}
            className={styles.avatarImg}
            onError={() => {
              if (!imgError) setImgError(true);
            }}
          />
        </div>
        {isMe && <div className={styles.addButton}>+</div>}
      </div>
      <span className={styles.username}>
        {isMe ? 'Your story' : username}
      </span>
    </div>
  );
};

export default StoryCircle;
