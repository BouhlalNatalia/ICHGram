import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import type { IUser } from '../types/index';

export const useSearch = (onClose?: () => void) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  

  const [recentSearches, setRecentSearches] = useState<IUser[]>(() => {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const users = await postService.searchUsers(searchQuery);
        setResults(users);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);


  const handleUserClick = (user: IUser) => {
  
    const filtered = recentSearches.filter((item) => item._id !== user._id);
  
    const updated = [user, ...filtered].slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));

    navigate(`/profile/${user._id}`);
    
    if (onClose) onClose();
    setSearchQuery('');
  };


  const removeRecentItem = (userId: string) => {
    const updated = recentSearches.filter((item) => item._id !== userId);
    setRecentSearches(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  };


  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('search_history');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    handleUserClick,
    clearSearch,
    recentSearches,
    removeRecentItem,
    clearRecentSearches
  };
};