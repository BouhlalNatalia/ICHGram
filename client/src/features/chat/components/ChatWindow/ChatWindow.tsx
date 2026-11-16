import React, { useRef, useEffect } from 'react';
import { useAppSelector } from '../../../../hook/storeHooks'; 
import { Trash2, ArrowLeft } from 'lucide-react'; 
import styles from './ChatWindow.module.css'; 
import MessageBubble from './MessageBubble';
import MessageInput from '../MessageInput/MessageInput';
import type { IMessage } from '../../types/chat.types';
import { formatChatDate } from '../../../../utils/formatDate'; 
import { getImageUrl } from '../../../../config'; 

interface ChatUser {
  id: string;
  username: string;
  avatarUrl: string; 
}

interface ChatWindowProps {
  user?: ChatUser | null;
  messages: IMessage[];
  onSendMessage: (text: string) => void;
  onViewProfile?: () => void; 
  onDeleteChat?: () => void; 
  onBack?: () => void; 
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  user, 
  messages, 
  onSendMessage, 
  onViewProfile, 
  onDeleteChat,
  onBack 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  if (!user) {
    return (
      <div className={styles.chatWindow}>
        <div style={{ margin: 'auto', textAlign: 'center', color: '#8e8e8e' }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>💬</div>
          <h3>Ваши сообщения</h3>
          <p>Отправляйте личные фото и сообщения другу.</p>
        </div>
      </div>
    );
  }

  const finalAvatarUrl = getImageUrl(user.avatarUrl);

  const chatStartDate = messages.length > 0 
    ? formatChatDate(messages[0].createdAt) 
    : formatChatDate(new Date().toISOString());

  return (
    <div className={styles.chatWindow}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button 
              type="button" 
              className={styles.mobileBackArrow} 
              onClick={onBack}
            >
              <ArrowLeft size={24} />
            </button>
          )}
          
          <div className={styles.userInfo} onClick={onViewProfile} style={{ cursor: 'pointer' }}>
            <img src={finalAvatarUrl} className={styles.miniAvatar} alt="avatar" />
            <span className={styles.username}>{user.username}</span>
          </div>
        </div>

        {onDeleteChat && (
          <button 
            type="button" 
            className={styles.deleteChatBtn} 
            onClick={onDeleteChat}
            title="Удалить чат"
          >
            <Trash2 size={20} />
          </button>
        )}
      </header>

      <div className={styles.messagesArea} ref={ref}>
        <div className={styles.chatProfileInfo}>
          <img 
            src={finalAvatarUrl} 
            className={styles.largeAvatar} 
            alt="large avatar" 
            onClick={onViewProfile}
            style={{ cursor: 'pointer' }}
          />
          <h2 className={styles.profileName} onClick={onViewProfile} style={{ cursor: 'pointer' }}>
            {user.username}
          </h2>
          <span className={styles.profileTag}>{user.username} · ICHGram</span>
          <button className={styles.viewProfileBtn} onClick={onViewProfile}>
            View profile
          </button>
          <div className={styles.dateSeparator}>{chatStartDate}</div>
        </div>

        <div className={styles.bubblesList}>
          {messages.map((msg, index) => {
            const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
            const isOwn = senderId === currentUser?._id;
            return (
              <MessageBubble
                key={msg._id || index} 
                text={msg.text}
                isOwn={isOwn}
                avatarUrl={isOwn ? undefined : finalAvatarUrl}
              />
            );
          })}
        </div>
      </div>

      <footer className={styles.footer}>
        <MessageInput onSend={onSendMessage} />
      </footer>
    </div>
  );
};

export default ChatWindow;