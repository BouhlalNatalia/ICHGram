import React from 'react';
import styles from './EndOfFeed.module.css';
import checkIcon from '../../../assets/icons/check-icon.svg'; 

const EndOfFeed: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.iconCircle}>
        <img 
          src={checkIcon} 
          alt="Success" 
          className={styles.checkImg} 
        />
      </div>
      
      <h3 className={styles.title}>You've seen all the updates</h3>
      <p className={styles.subtitle}>You have viewed all new publications</p>
    </div>
  );
};
export default EndOfFeed;