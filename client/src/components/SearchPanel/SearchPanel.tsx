import React from 'react';
import { XCircle, X } from 'lucide-react'; 
import SidePanel from '../ui/SidePanel/SidePanel';
import { useSearch } from '../../hook/useSearch';
import { getImageUrl } from '../../config'; 
import styles from './SearchPanel.module.css';

const SearchPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    handleUserClick, 
    clearSearch,
    recentSearches,
    removeRecentItem,
    clearRecentSearches
  } = useSearch(onClose);

  return (
    <SidePanel isOpen={isOpen} title="Search">
      <div className={styles.panelContainer}>
        <div className={styles.searchWrapper}>
          <div className={styles.inputContainer}>
            <input 
              type="text"
              className={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.clearButton} onClick={clearSearch} type="button">
                <XCircle size={16} color="#c7c7c7" />
              </button>
            )}
          </div>
        </div>

        <div className={styles.scrollableArea}>
      
          {!searchQuery && (
            <>
              <div className={styles.recentHeader}>
                <span className={styles.recentTitle}>Recent</span>
                {recentSearches.length > 0 && (
                  <button className={styles.clearAllBtn} onClick={clearRecentSearches} type="button">
                    Clear all
                  </button>
                )}
              </div>

              <div className={styles.resultsContent}>
                {recentSearches.length > 0 ? (
                  recentSearches.map(user => (
                    <div 
                      key={`recent-${user._id}`} 
                      className={styles.userItem} 
                      onClick={() => handleUserClick(user)} 
                    >
                      <img 
                        src={getImageUrl(user.avatar)} 
                        alt={user.username} 
                        className={styles.avatar} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
                        }}
                      />
                      <div className={styles.userInfo}>
                        <span className={styles.username}>{user.username}</span>
                      </div>
                      <button 
                        className={styles.removeBtn} 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          removeRecentItem(user._id);
                        }}
                      >
                        <X size={14} color="#8e8e8e" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className={styles.noRecentText}>No recent searches.</p>
                )}
              </div>
            </>
          )}

        
          {searchQuery && (
            <div className={styles.resultsContent}>
              {isLoading ? (
                <p className={styles.infoText}>Searching...</p>
              ) : results.length > 0 ? (
                results.map(user => (
                  <div 
                    key={user._id} 
                    className={styles.userItem} 
                    onClick={() => handleUserClick(user)} 
                  >
                    <img 
                      src={getImageUrl(user.avatar)} 
                      alt={user.username} 
                      className={styles.avatar} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
                      }}
                    />
                    <div className={styles.userInfo}>
                      <span className={styles.username}>{user.username}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noRecentText}>No results found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </SidePanel>
  );
};

export default SearchPanel;