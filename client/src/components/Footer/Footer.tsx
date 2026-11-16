import React from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from "react-router-dom"; 
import styles from "./Footer.module.css";

const Footer: FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();


  const safeScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const emit = (name: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    safeScrollToTop(); 
       window.dispatchEvent(new CustomEvent(name));
  };


  const handleNavigation = (path: string) => {
    safeScrollToTop(); 
    navigate(path);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.linksContainer}>

  
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => handleNavigation('/')}
        >
          Home
        </button>

  
        <button
          type="button"
          className={styles.linkButton}
          onClick={emit("sidebar:openSearch")}
        >
          Search
        </button>

     
        <Link 
          to="/explore" 
          className={styles.link} 
          onClick={safeScrollToTop}
        >
          Explore
        </Link>

      
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => handleNavigation('/messages')}
        >
          Messages
        </button>

        <button
          type="button"
          className={styles.linkButton}
          onClick={emit("sidebar:openNotifications")}
        >
          Notifications
        </button>

   
        <button
          type="button"
          className={styles.linkButton}
          onClick={emit("sidebar:openCreate")}
        >
          Create
        </button>
      </div>
      <p className={styles.copyright}>© {currentYear} ICHgram</p>
    </footer>
  );
};

export default Footer;