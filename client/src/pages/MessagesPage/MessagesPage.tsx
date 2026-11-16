import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import { useChat } from '../../features/chat/hook/useChat';
import { useAppSelector, useAppDispatch } from '../../hook/storeHooks';
import { setActiveChat, fetchChats, accessChatThunk } from '../../features/chat/model/chatSlice';
import { getImageUrl } from '../../config';
import ChatList from '../../features/chat/components/ChatList/ChatList';
import ChatWindow from '../../features/chat/components/ChatWindow/ChatWindow';
import styles from './MessagesPage.module.css';

import type { IChatParticipant } from '../../features/chat/types/chat.types';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const { 
    chats, 
    messages, 
    activeChatId, 
    setActiveChatId, 
    sendMessage, 
    deleteChat 
  } = useChat();

  const isProcessedRef = useRef(false);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    
    if (targetUserId && !isProcessedRef.current) {
      isProcessedRef.current = true;

      dispatch(accessChatThunk(targetUserId))
        .unwrap()
        .then((chat) => {
          if (chat && chat._id) {
            dispatch(setActiveChat(String(chat._id)));
            dispatch(fetchChats());
          }
        })
        .catch((err) => {
          console.error("Ошибка при открытии/создании чата из URL:", err);
        });

      setSearchParams({});
    }
  }, [searchParams, dispatch, setSearchParams]);

  useEffect(() => {
    return () => {
      dispatch(setActiveChat(null)); 
    };
  }, [dispatch]);

  const handleDeleteCurrentChat = async () => {
    if (!activeChatId) return;
    
    const confirmDelete = window.confirm("Вы уверены, что хотите удалить этот чат и всю историю сообщений?");
    if (!confirmDelete) return;

    try {
      if (typeof deleteChat === 'function') {
        await deleteChat(String(activeChatId));
      }
      
      dispatch(setActiveChat(null));
      dispatch(fetchChats());
    } catch (error) {
      console.error("Ошибка при удалении чата:", error);
    }
  };

  const activeChat = chats.find((chat) => String(chat._id) === String(activeChatId));

  const partner = activeChat?.participants.find(
    (p: IChatParticipant) => String(p._id) !== String(currentUser?._id)
  );

  const activeChatUser = activeChat && partner ? {
    id: partner._id,
    username: partner.username,
    avatarUrl: getImageUrl(partner.avatar) 
  } : null;

  const responsiveClass = activeChat ? styles.showChatArea : styles.showSidebar;

  return (
    <div className={`${styles.pageContainer} ${responsiveClass}`}>
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <h1 className={styles.currentUsername}>
            {currentUser?.username || 'Messages'}
          </h1>
          <button 
            className={styles.mobileEmptyBtn} 
            onClick={() => navigate('/search')}
          >
            Найти пользователя
          </button>
        </header>
        <div className={styles.chatListWrapper}>
          <ChatList
            chats={chats}
            activeId={activeChatId !== null ? String(activeChatId) : null}
            onChatSelect={(id) => setActiveChatId(id)}
          />
        </div>
      </aside>

      <main className={styles.chatArea}>
        {activeChat && activeChatUser ? (
          <ChatWindow
            user={activeChatUser as any}
            messages={messages}
            onSendMessage={sendMessage}
            onViewProfile={() => navigate(`/profile/${activeChatUser.username}`)}
            onDeleteChat={handleDeleteCurrentChat}
            onBack={() => dispatch(setActiveChat(null))}
          />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <MessagesSquare size={96} strokeWidth={1} />
            </div>
            <h3>Ваши сообщения</h3>
            <p>Выбирайте чат в списке слева или найдите друга.</p>
            <button className={styles.emptyBtn} onClick={() => navigate('/search')}>
              Найти пользователя
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
 
export default MessagesPage;