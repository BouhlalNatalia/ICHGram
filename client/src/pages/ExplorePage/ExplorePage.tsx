import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './ExplorePage.module.css';
import { MessageCircle } from 'lucide-react';

import type { IPost } from '../../features/feed/types/feed.types';
import type { RootState } from '../../store';
import { useAppDispatch } from '../../hook/storeHooks';
import { getImageUrl } from '../../config';
import { usePosts } from '../../hook/usePosts';
import { toggleLikeThunk, setCurrentPost } from '../../features/feed/model/feedSlice'; 

import LikeButton from '../../components/ui/LikeButton/LikeButton';
import  PostModal  from '../../features/feed/components/PostModal/PostModal';

const ExplorePage = () => {
  const dispatch = useAppDispatch();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const feedPosts = useSelector((state: RootState) => state.feed.posts);

  const { explorePosts, isLoading } = usePosts(user);
  const currentPost = useSelector((state: RootState) => state.feed.currentPost);
  const [overrides, setOverrides] = useState<Record<string, IPost>>({});

  // explorePosts живут в локальном стейте хука — подмешиваем свежие версии постов после лайка/комментария
  const displayedPosts = useMemo(
    () =>
      explorePosts.map((p: IPost) =>
        currentPost?._id === p._id ? currentPost : overrides[p._id] ?? p
      ),
    [explorePosts, overrides, currentPost]
  );

  const activePost = useMemo(() => {
    const found = feedPosts.find((p: IPost) => p._id === selectedPostId);
    return found || explorePosts.find((p: IPost) => p._id === selectedPostId) || null;
  }, [feedPosts, explorePosts, selectedPostId]);

  if (!user) return null;
  if (isLoading && displayedPosts.length === 0) return <div className={styles.loading}>Loading...</div>;

  const onLikeClick = (postId: string) => {
    dispatch(toggleLikeThunk(postId))
      .unwrap()
      .then((updated) => setOverrides((prev) => ({ ...prev, [updated._id]: updated })))
      .catch((err) => console.error('Like failed:', err));
  };

  const handleOpenPostModal = (post: IPost) => {
    setSelectedPostId(post._id);
    localStorage.setItem('openedPostId', post._id);
    dispatch(setCurrentPost(post));
  };

  return (
    <div className={styles.exploreContainer}>
      <div className={styles.exploreGrid}>
        {displayedPosts.map((post: IPost, index: number) => {
          const mod = index % 10;
          const isTallRight = mod === 2;
          const isTallLeft = mod === 5;
          const isLiked = !!post.likes?.some((like: any) => String(typeof like === 'object' ? like._id : like) === String(user._id));

          return (
            <div key={post._id} className={`${styles.postWrapper} ${isTallRight ? styles.tallRight : ''} ${isTallLeft ? styles.tallLeft : ''}`} onClick={() => handleOpenPostModal(post)}>
              <img src={getImageUrl(post.image)} alt={post.description} className={styles.image} />
              <div className={styles.overlay}>
                <div className={styles.authorBadge}>
                  <Link to={`/profile/${post.user?._id}`} className={styles.authorLink} onClick={(e) => e.stopPropagation()}>@{post.user?.username || 'user'}</Link>
                </div>
                <div className={styles.stats}>
                  <div className={styles.statItem} onClick={(e) => e.stopPropagation()}>
                    <LikeButton isLiked={isLiked} likesCount={post.likes?.length} onLike={() => onLikeClick(post._id)} size={22} />
                  </div>
                  <div className={styles.statItem}><MessageCircle size={22} fill="white" stroke="white" /> <span>{post.comments?.length || 0}</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPostId && activePost && (
        <PostModal
          isOpen={true}
          onClose={() => {
            setSelectedPostId(null);
            localStorage.removeItem('openedPostId');
            dispatch(setCurrentPost(null));
          }}
        />
      )}
    </div>
  );
};

export default ExplorePage;