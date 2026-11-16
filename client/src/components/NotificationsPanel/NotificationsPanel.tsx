
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import SidePanel from '../ui/SidePanel/SidePanel';
import { useAppDispatch, useAppSelector } from '../../hook/storeHooks';
import {
    fetchNotifications,
    markAllAsReadThunk,
    updateFollowStatusInNotifications,
    deleteAllNotificationsThunk,
    deleteNotificationThunk
} from '../../features/feed/model/notificationSlice';
import { toggleFollowUser, updateProfileFollowers } from '../../features/profile/model/profileSlice';
import { getImageUrl } from '../../config';
import type { INotification } from '../../types/index';

import styles from './NotificationsPanel.module.css';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose?: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const notifications = useAppSelector(state => state.notifications.items as INotification[]);
    const currentUser = useAppSelector(state => state.auth.user);

    useEffect(() => {
        if (isOpen) {
            const loadNotifications = async () => {
                try {
                    await dispatch(fetchNotifications()).unwrap();
                    await dispatch(markAllAsReadThunk()).unwrap();
                } catch (error) {
                    console.error('Failed to load notifications:', error);
                }
            };

            loadNotifications();
        }
    }, [isOpen, dispatch]);

    const handleUserClick = (username: string | undefined) => {
        if (!username) return;
        navigate(`/profile/${username}`);
        if (onClose) onClose();
    };

    const handleDeleteOne = (e: React.MouseEvent, notifId: string) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch(deleteNotificationThunk(notifId));
    };

    const handleFollowClick = async (e: React.MouseEvent, userId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId || !currentUser?._id) return;

        try {
            const result = await dispatch(toggleFollowUser({
                userId,
                currentUserId: currentUser._id
            })).unwrap();

            dispatch(updateFollowStatusInNotifications({
                userId,
                currentUserId: currentUser._id,
                isFollowing: result.isFollowing
            }));

            dispatch(updateProfileFollowers({
                currentUserId: currentUser._id,
                isFollowing: result.isFollowing
            }));

        } catch (err) {
            console.error("Failed to follow from notifications:", err);
        }
    };

    const handleDeleteAll = () => {
        const confirmDelete = window.confirm("Вы уверены, что хотите полностью очистить историю уведомлений?");
        if (!confirmDelete) return;

        dispatch(deleteAllNotificationsThunk());
    };

    return (
        <SidePanel isOpen={isOpen} title="Notifications">
            <div className={styles.section} onClick={(e) => e.stopPropagation()}>

                <div className={styles.panelHeaderActions}>
                    <h3 className={styles.sectionTitle}>Recent</h3>
                    {notifications.length > 0 && (
                        <div className={styles.managementButtons}>
                            <button
                                className={styles.deleteIconButton}
                                onClick={handleDeleteAll}
                                title="Clear all notifications"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.notifScrollContainer}>
                    <div className={styles.notifList}>
                        {notifications.length === 0 && (
                            <p className={styles.empty}>No notifications yet.</p>
                        )}

                        {notifications.map((notif) => {
                            const fromUser = notif.fromUser;

                            const isFollowing = currentUser?.following?.some(
                                (userId) => userId === fromUser?._id
                            ) ?? false;

                            return (
                                <div
                                    key={notif._id}
                                    className={`${styles.notifItem} ${notif.read ? styles.read : styles.unread}`}
                                    onClick={() => handleUserClick(fromUser?.username)}
                                >
                                    <img
                                        src={getImageUrl(fromUser?.avatar)}
                                        alt={fromUser?.username || 'User'}
                                        className={styles.avatar}
                                    />

                                    <div className={styles.notifContent}>
                                        <span className={styles.notifText}>
                                            <strong>{fromUser?.username || 'Unknown User'}</strong>
                                            {' '}
                                            {notif.type === 'like' && 'liked your photo.'}
                                            {notif.type === 'follow' && 'started following you.'}
                                            {notif.type === 'comment' && 'commented on your photo.'}
                                        </span>
                                        <span className={styles.time}>
                                            {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>

                                    <div className={styles.notifAction}>
                                        {(notif.type === 'like' || notif.type === 'comment') && notif.post?.image && (
                                            <img
                                                src={getImageUrl(notif.post.image)}
                                                alt="post preview"
                                                className={styles.postThumb}
                                            />
                                        )}

                                        {notif.type === 'follow' && fromUser?._id !== currentUser?._id && (
                                            <button
                                                className={isFollowing ? styles.followingBtn : styles.followBtn}
                                                onClick={(e) => handleFollowClick(e, fromUser._id)}
                                            >
                                                {isFollowing ? 'Following' : 'Follow'}
                                            </button>
                                        )}

                                        <button
                                            className={styles.singleDeleteBtn}
                                            onClick={(e) => handleDeleteOne(e, notif._id)}
                                            title="Delete notification"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </SidePanel>
    );
};

export default NotificationsPanel;
