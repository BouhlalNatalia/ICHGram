
import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import SearchPanel from '../SearchPanel/SearchPanel';
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel';
import CreatePostModal from '../CreatePostModal/CreatePostModal';
import { useLayout } from '../../hook/useLayout';
import { useAppDispatch } from '../../hook/storeHooks';
import { fetchNotifications } from '../../features/feed/model/notificationSlice';
import type { IUser } from '../../types/index';
import type { IPost } from '../../features/feed/types/feed.types';

import styles from './Layout.module.css';

interface LayoutProps {
  user: IUser | null;
  onAddNewPost: (data: { file: File | null; caption: string }) => Promise<IPost>;
}

const Layout: React.FC<LayoutProps> = ({ user, onAddNewPost }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const mainContentRef = useRef<HTMLElement>(null);

  const {
    activePanel,
    isCreateModalOpen,
    editingPost,
    togglePanel,
    closeAll,
    handlePublish,
    openCreateModal
  } = useLayout(user, onAddNewPost);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    const safeScrollToTop = () => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handleOpenNotifications = () => {
      safeScrollToTop();
      closeAll();
      togglePanel('notifications');
    };

    const handleOpenSearch = () => {
      safeScrollToTop();
      togglePanel('search');
    };

    const handleOpenCreate = () => {
      safeScrollToTop();
      openCreateModal();
    };

    const handleOpenMessages = () => {
      safeScrollToTop();
      navigate('/messages');
    };

    window.addEventListener("sidebar:openNotifications", handleOpenNotifications);
    window.addEventListener("sidebar:openSearch", handleOpenSearch);
    window.addEventListener("sidebar:openCreate", handleOpenCreate);
    window.addEventListener("sidebar:openMessages", handleOpenMessages);

    return () => {
      window.removeEventListener("sidebar:openNotifications", handleOpenNotifications);
      window.removeEventListener("sidebar:openSearch", handleOpenSearch);
      window.removeEventListener("sidebar:openCreate", handleOpenCreate);
      window.removeEventListener("sidebar:openMessages", handleOpenMessages);
    };
  }, [togglePanel, openCreateModal, navigate, closeAll]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContentArea}>
        <aside className={styles.sidebarSection}>
          <Sidebar
            currentUser={user}
            activePanel={activePanel}
            onCreateClick={openCreateModal}
            onSearchClick={() => togglePanel('search')}
            onNotifClick={() => togglePanel('notifications')}
            onClosePanels={closeAll}
          />

          {activePanel === 'search' && <SearchPanel isOpen={true} onClose={closeAll} />}

          {activePanel === 'notifications' && <NotificationsPanel isOpen={true} />}
        </aside>

        <main ref={mainContentRef} className={styles.contentSection}>
          <div className={styles.feedWrapper}>
            <Outlet context={{ togglePanel }} />
          </div>

          {activePanel && <div className={styles.panelsOverlay} onClick={closeAll} />}

          {isCreateModalOpen && user && (
            <div className={styles.createPostOverlay} onClick={closeAll}>
              <div onClick={(e) => e.stopPropagation()}>
                <CreatePostModal
                  user={user}
                  onClose={closeAll}
                  onPublish={handlePublish}
                  initialData={editingPost || undefined}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className={styles.footerSection}>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
