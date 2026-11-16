import React, { useMemo, useState } from 'react';
import styles from './ChatList.module.css';

interface ChatItemProps {
  username: string;
  lastMessage: string;
  avatarUrl: string | null | undefined;
  time: string;
  isActive?: boolean;
  onClick?: () => void;
  unreadCount?: number; 
}

const ChatItem: React.FC<ChatItemProps> = ({
  username,
  lastMessage,
  avatarUrl,
  time,
  isActive,
  onClick,
  unreadCount = 0, 
}) => {
  const [hasError, setHasError] = useState(false);

  const finalAvatarUrl = useMemo(() => {
    if (!avatarUrl || hasError) {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
    }
    const cacheBuster = new Date().getMinutes(); 
    return avatarUrl.includes('?') 
      ? `${avatarUrl}&t=${cacheBuster}` 
      : `${avatarUrl}?t=${cacheBuster}`;
  }, [avatarUrl, username, hasError]);

 
  const showBadge = unreadCount > 0 && !isActive;

  return (
    <div
      className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >

      <div className={styles.avatarContainer}>
        <img 
          src={finalAvatarUrl} 
          alt={username} 
          className={styles.avatar}
          onError={() => setHasError(true)}
        />
        
        {showBadge && (
          <div className={styles.unreadBadge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.topRow}>
          <span className={`${styles.username} ${showBadge ? styles.unreadBold : ''}`}>
            {username}
          </span>
        </div>

        <div className={styles.messageRow}>
          <span className={`${styles.lastMessage} ${showBadge ? styles.unreadText : ''}`}>
            {lastMessage || 'Нет сообщений'}
          </span>
          <span className={styles.dot}>•</span>
          <span className={styles.time}>{time}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;