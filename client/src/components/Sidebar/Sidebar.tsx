
import React, { useMemo } from 'react';
import { Home, Search, Compass, MessageCircle, Heart, PlusSquare } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import logoImg from '../../assets/icons/ichgram_seidbar.svg';
import styles from "./Sidebar.module.css";
import type { IUser } from '../../types/index';
import { useAppSelector } from '../../hook/storeHooks';
import { getImageUrl, DEFAULT_AVATAR } from '../../config';

interface SidebarProps {
  onCreateClick: () => void;
  onSearchClick: () => void;
  onNotifClick: () => void;
  onClosePanels: () => void;
  activePanel: 'search' | 'notifications' | 'messages' | null;
  currentUser: IUser | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  onCreateClick,
  currentUser,
  onSearchClick,
  onNotifClick,
  onClosePanels,
  activePanel
}) => {
  const { chats } = useAppSelector((state) => state.chat);

  const notifications = useAppSelector(
    (state) => state.notifications.items
  );

  const totalUnread = useMemo(() => {
    return chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
  }, [chats]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notif) => !notif.read).length;
  }, [notifications]);

  const getNavItemClass = (isActive: boolean, panelName?: string) => {
    const isPanelActive = activePanel === panelName;
    const isLinkActive = isActive && !activePanel;
    return (isLinkActive || isPanelActive) ? `${styles.navItem} ${styles.active}` : styles.navItem;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <Link to="/" onClick={onClosePanels}>
          <img src={logoImg} alt="ICHGRAM" className={styles.logoImage} />
        </Link>
      </div>

      <nav className={styles.sidebarNav}>
        <NavLink to="/" className={({ isActive }) => getNavItemClass(isActive)} onClick={onClosePanels}>
          <Home size={26} strokeWidth={1.5} />
          <span className={styles.navText}>Home</span>
        </NavLink>

        <div
          className={getNavItemClass(false, 'search')}
          onClick={() => {
            scrollToTop();
            onSearchClick();
          }}
        >
          <Search size={26} strokeWidth={1.5} />
          <span className={styles.navText}>Search</span>
        </div>

        <NavLink to="/explore" className={({ isActive }) => getNavItemClass(isActive)} onClick={onClosePanels}>
          <Compass size={26} strokeWidth={1.5} />
          <span className={styles.navText}>Explore</span>
        </NavLink>

        <NavLink to="/messages" className={({ isActive }) => getNavItemClass(isActive)} onClick={onClosePanels}>
          <div className={styles.iconContainer}>
            <MessageCircle size={26} strokeWidth={1.5} />
            {totalUnread > 0 && (
              <div className={styles.totalBadge}>
                {totalUnread > 9 ? '9+' : totalUnread}
              </div>
            )}
          </div>
          <span className={styles.navText}>Messages</span>
        </NavLink>

        <div
          className={getNavItemClass(false, 'notifications')}
          onClick={() => {
            scrollToTop();
            onNotifClick();
          }}
        >
          <div className={styles.iconContainer}>
            <Heart size={26} strokeWidth={1.5} />
            {unreadNotifications > 0 && (
              <div className={styles.totalBadge}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </div>
            )}
          </div>
          <span className={styles.navText}>Notifications</span>
        </div>

        <div
          className={styles.navItem}
          onClick={() => {
            scrollToTop();
            onCreateClick();
          }}
        >
          <PlusSquare size={26} strokeWidth={1.5} />
          <span className={styles.navText}>Create</span>
        </div>

        <NavLink
          to={currentUser?.username ? `/profile/${currentUser.username}` : '/login'}
          className={({ isActive }) => `${getNavItemClass(isActive)} ${styles.profileItem}`}
          onClick={onClosePanels}
        >
          <div className={styles.avatarContainer}>
            <img
              src={getImageUrl(currentUser?.avatar)}
              alt="Profile"
              className={styles.miniAvatar}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== DEFAULT_AVATAR) target.src = DEFAULT_AVATAR;
              }}
            />
          </div>
          <span className={styles.navText}>{currentUser?.username || 'Profile'}</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
