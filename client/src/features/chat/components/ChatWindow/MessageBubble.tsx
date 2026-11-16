import styles from './ChatWindow.module.css';

interface Props {
  text: string;
  isOwn: boolean;
  avatarUrl?: string;
}

const MessageBubble: React.FC<Props> = ({ text, isOwn, avatarUrl }) => {
  return (
    <div className={`${styles.messageRow} ${isOwn ? styles.ownRow : styles.otherRow}`}>
      {!isOwn && avatarUrl && (
        <img src={avatarUrl} className={styles.msgAvatar} />
      )}

      <div className={styles.bubble}>{text}</div>

      {isOwn && avatarUrl && (
        <img src={avatarUrl} className={styles.msgAvatarSmall} />
      )}
    </div>
  );
};

export default MessageBubble;