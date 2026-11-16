import React from 'react';
import styles from './ActionMenu.module.css';

interface ActionMenuProps {
  onClose: () => void;
  onGoToPost?: () => void;
  onCopyLink?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  onClose, 
  onGoToPost, 
  onCopyLink, 
  onDelete, 
  onEdit,
}) => {
  return (
    <div 
      className={styles.menuOverlay} 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); 
        onClose();
      }}
    >
      <div 
        className={styles.menuContent} 
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Кнопка Delete */}
        {onDelete && (
          <button 
            className={`${styles.menuItem} ${styles.danger}`} 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </button>
        )}

        
        {onEdit && (
          <button 
            className={styles.menuItem} 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>
        )}

      
        {onGoToPost && (
          <button 
            className={styles.menuItem} 
            onClick={(e) => {
              e.stopPropagation();
              onGoToPost();
            }}
          >
            Go to post
          </button>
        )}

     
        {onCopyLink && (
          <button 
            className={styles.menuItem} 
            onClick={(e) => {
              e.stopPropagation();
              onCopyLink();
            }}
          >
            Copy link
          </button>
        )}

   
        <button 
          className={styles.menuItem} 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ActionMenu;