import React from 'react';
import { X } from 'lucide-react'; 
import styles from './SidePanel.module.css';

interface SidePanelProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, title, children }) => {
  

  const handleMobileClose = () => {
    const overlay = document.querySelector(`[class*="panelsOverlay"]`) as HTMLElement;
    if (overlay) overlay.click();
  };

  return (
    <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        
   
        <button className={styles.mobileCloseBtn} onClick={handleMobileClose} type="button">
          <X size={24} color="#000" />
        </button>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default SidePanel;