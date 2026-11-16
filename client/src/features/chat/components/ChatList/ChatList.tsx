import React from 'react';
import ChatItem from '../ChatList/ChatItem';
import styles from './ChatList.module.css';
import type { IChat, IChatParticipant } from '../../types/chat.types';
import { useAppSelector } from '../../../../hook/storeHooks';
import { getImageUrl } from '../../../../config'; 

interface ChatListProps {
  chats: IChat[];
  activeId: string | number | null;
  onChatSelect: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, activeId, onChatSelect }) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  return (
    <div className={styles.chatList}>
      {chats.map((chat) => {
        const partner = chat.participants.find(
          (p: IChatParticipant) => String(p._id) !== String(currentUser?._id)
        );

        const timeDisplay = chat.updatedAt
          ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';


        const avatarUrl = getImageUrl(partner?.avatar);

        const lastMsgText = typeof chat.lastMessage === 'object'
          ? chat.lastMessage.text
          : chat.lastMessage;

        return (
          <ChatItem
            key={chat._id}
            username={partner?.username || 'User'}
            lastMessage={lastMsgText || 'Нет сообщений'}
            avatarUrl={avatarUrl}
            time={timeDisplay}
            isActive={String(chat._id) === String(activeId)}
            onClick={() => onChatSelect(chat._id)}
            unreadCount={chat.unreadCount}
          />
        );
      })}
    </div>
  );
};

export default ChatList;