import React from 'react';
import { XCircle, X, User, ArrowLeft } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 
import { useSearch } from '../../hook/useSearch';
import { getImageUrl } from '../../config';
import styles from './SearchPage.module.css'; 

const SearchPage: React.FC = () => {
    const navigate = useNavigate(); 
    
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
    } = useSearch();


    const handleSelectUserForChat = (user: any) => {
        if (!user || !user._id) return;

        try {
           
            handleUserClick(user); 
        } catch (e) {
            console.error("Ошибка сохранения в Recent:", e);
        }

        navigate(`/messages?userId=${user._id}`); 
    };

    return (
        <div className={styles.searchContainer}>
            <button 
                type="button" 
                className={styles.backButton} 
                onClick={() => navigate('/messages')} 
                title="Back to messages"
            >
                <ArrowLeft size={24} color="#262626" />
            </button>

            <h2 className={styles.title}>Search Users</h2>

            <div className={styles.searchRow}>
                <div className={styles.searchBarWrapper}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        autoFocus
                    />
                    {searchQuery && (
                        <button className={styles.clearButton} onClick={clearSearch} type="button">
                            <XCircle size={18} color="#c7c7c7" />
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.resultsList}>
                {isLoading && <div className={styles.statusText}>Searching...</div>}

             
                {!searchQuery && !isLoading && (
                    <div className={styles.historySection}>
                        <div className={styles.historyHeader}>
                            <span>Recent</span>
                            {recentSearches.length > 0 && (
                                <button className={styles.clearAllBtn} onClick={clearRecentSearches} type="button">
                                    Clear all
                                </button>
                            )}
                        </div>

                        {recentSearches.length > 0 ? (
                            recentSearches.map((user) => (
                                <div
                                    key={`recent-page-${user._id}`}
                                    className={styles.userCard}
                                    onClick={() => handleSelectUserForChat(user)}
                                >
                                    {user.avatar ? (
                                        <img src={getImageUrl(user.avatar)} alt="" className={styles.avatar} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            <User size={20} />
                                        </div>
                                    )}
                                    <div className={styles.userInfo}>
                                        <span className={styles.username}>{user.username}</span>
                                    </div>
                                    <button
                                        className={styles.removeHistoryBtn}
                                        type="button"
                                        onClick={(e) => {
                                           
                                            e.stopPropagation();
                                            removeRecentItem(user._id);
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={styles.statusText}>Your recent searches will appear here</div>
                        )}
                    </div>
                )}

            
                {searchQuery && !isLoading && (
                    <>
                        {results.length > 0 ? (
                            results.map((user) => (
                                <div
                                    key={user._id}
                                    className={styles.userCard}
                                    onClick={() => handleSelectUserForChat(user)} 
                                >
                                    {user.avatar ? (
                                        <img src={getImageUrl(user.avatar)} alt="" className={styles.avatar} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            <User size={20} />
                                        </div>
                                    )}
                                    <div className={styles.userInfo}>
                                        <span className={styles.username}>{user.username}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.statusText}>No users found</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;