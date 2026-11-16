import React, { useState, useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import styles from './PostCard.module.css';
import type { IPost } from '../../types/feed.types';
import { getImageUrl } from '../../../../config';
import LikeButton from '../../../../components/ui/LikeButton/LikeButton';
import { formatRelativeTime } from '../../../../utils/formatDate';
import { useAppSelector } from '../../../../hook/storeHooks';

interface PostCardProps {
  post: IPost;
  onLike: (id: string) => void;
  onFollow: (userId: string) => void; 
  onDelete: (id: string) => void;
  onEdit: (e?: any) => void; 
  onOpenModal: () => void;
  currentUserId: string;
  isModal?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onFollow,
  onOpenModal,
  currentUserId,
  isModal = false
}) => {
  const [isPending, setIsPending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const currentUser = useAppSelector(state => state.auth.user);

  const isOwner = String(post.user?._id) === String(currentUserId);

  const isFollowing = useMemo(() => {
    if (!currentUser?.following || !post.user?._id) return false;
    return currentUser.following.some((followingUser: any) => {
      const followingId = typeof followingUser === 'object' && followingUser !== null
        ? followingUser._id
        : followingUser;
      return String(followingId) === String(post.user?._id);
    });
  }, [currentUser?.following, post.user?._id]);

  const isLiked = !!post.likes?.some((like: string | { _id: string }) => {
    if (typeof like === 'object' && like !== null) {
      return String(like._id) === String(currentUserId);
    }
    return String(like) === String(currentUserId);
  });

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!post.user?._id || isPending) return;
    try {
      setIsPending(true);
      await onFollow(post.user._id); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const description = post.description || '';
  const lines = description.split('\n');
  const isLongDescription = description.length > 60 || lines.length > 2;
  const displayedText = isLongDescription && !isExpanded 
    ? `${lines.slice(0, 2).join('\n').slice(0, 60)}...` 
    : description;

  return (
    <article className={styles.postCard}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
       
          <Link to={`/profile/${post.user?.username}`} className={styles.avatarLink} onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(post.user?.avatar)}
              alt={post.user?.username || 'User'}
              className={styles.avatar}
            />
          </Link>
          <div className={styles.metaData}>
            {/* ИСПРАВЛЕНО: Линк изменен на username */}
            <Link to={`/profile/${post.user?.username}`} className={styles.username} onClick={(e) => e.stopPropagation()}>
              {post.user?.username}
            </Link>
            <span className={styles.dot}>•</span>
            <span className={styles.time}>
              {formatRelativeTime(post.createdAt, true)}
            </span>

            {!isOwner && (
              <>
                <span className={styles.dot}>•</span>
                <button 
                  className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                  onClick={handleFollowClick}
                  disabled={isPending}
                >
                  {isPending ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className={styles.imageContainer} onClick={onOpenModal}>
        <img
          src={getImageUrl(post.image)}
          alt="post content"
          className={styles.postImage}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500?text=Image+Not+Found';
          }}
        />
      </div>

      <div className={styles.contentArea}>
        <div className={styles.actions}>
          <LikeButton isLiked={isLiked} onLike={() => onLike(post._id)} showCount={false} size={24} />
          <button onClick={onOpenModal} className={styles.actionBtn}>
            <MessageCircle size={24} color="#262626" />
          </button>
        </div>

        <div className={styles.likesCount}>{post.likes?.length || 0} likes</div>

        <div className={styles.caption}>
          {/* ИСПРАВЛЕНО: Линк изменен на username */}
          <Link to={`/profile/${post.user?.username}`} className={styles.captionUsername} onClick={(e) => e.stopPropagation()}>
            {post.user?.username}
          </Link>
          <span className={styles.captionText} style={{ whiteSpace: 'pre-line' }}>
            {displayedText}
          </span>

          {isLongDescription && (
            <button 
              className={styles.moreLinkBtn} 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? ' less' : ' more'}
            </button>
          )}
        </div>

        {!isModal && post.comments && post.comments.length > 0 && (
          <button className={styles.viewCommentsBtn} onClick={onOpenModal}>
            View all comments ({post.comments.length})
          </button>
        )}
      </div>
    </article>
  );
};

export default PostCard;