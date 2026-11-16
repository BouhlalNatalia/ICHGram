
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryCircle from '../../../../components/StoryCircle/StoryCircle';
import { useAppSelector } from '../../../../hook/storeHooks';
import { userService } from '../../../../services/userService';
import type { IStoryUser } from '../../../../services/userService';
import styles from './StoriesList.module.css';

const StoriesList: React.FC = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [friends, setFriends] = useState<IStoryUser[]>([]);

  const userId = currentUser?._id;
  const followingCount = currentUser?.following?.length ?? 0;
  const postsCount = useAppSelector((state) => state.feed.posts.length);

  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    userService
      .getFollowingActivity()
      .then((data) => setFriends(data))
      .catch((err) => console.error('Failed to load following list:', err));
  }, []);

  useEffect(() => {
    if (!userId) return;

    load();
    window.addEventListener('following:changed', load);

    return () => window.removeEventListener('following:changed', load);
  }, [userId, followingCount, postsCount, load]);

  // Перехватываем прокрутку колёсиком над Stories
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.deltaY;

      element.scrollLeft += delta;
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={styles.scrollWrapper}
        ref={scrollRef}
      >
        {currentUser && (
          <StoryCircle
            username={currentUser.username}
            avatarUrl={currentUser.avatar || ''}
            isMe={true}
            hasStory={false}
            onClick={() => navigate(`/profile/${currentUser.username}`)}
          />
        )}

        {friends.map((friend) => (
          <StoryCircle
            key={friend._id}
            username={friend.username}
            avatarUrl={friend.avatar || ''}
            hasStory={friend.hasNewPost}
            onClick={() => navigate(`/profile/${friend.username}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default StoriesList;
