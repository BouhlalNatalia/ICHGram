import React from 'react';
import phonesImage from "../../assets/images/Main_Background.png";
import styles from "./NotFoundPage.module.css";

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.imageSection}>
          <img src={phonesImage} alt="Not Found" className={styles.phonesImg} />
        </div>
        <div className={styles.textSection}>
          <h1 className={styles.title}>Oops! Page Not Found (404 Error)</h1>
          <p className={styles.description}>
            We're sorry, but the page you're looking for doesn't seem to exist.</p>
          <p className={styles.description}>If you typed the URL manually, please double-check the spelling.</p>
          <p className={styles.description}>If you clicked on a link, it may be outdated or broken.</p>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;