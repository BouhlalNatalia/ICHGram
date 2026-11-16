import React, { useState } from 'react';
import Toggle from '../../../../components/ui/Toggle/Toggle'; 
import styles from './NotificationSettings.module.css';

const NotificationSettings: React.FC = () => {
  const [pauseAll, setPauseAll] = useState(false);
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Notifications</h1>

      <div className={styles.section}>
        <div className={styles.settingRow}>
          <div className={styles.textInfo}>
            <span className={styles.label}>Pause all</span>
            <p className={styles.hint}>Temporarily pause all notifications</p>
          </div>
  
          <Toggle checked={pauseAll} onChange={setPauseAll} />
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactions</h2>
        
        <div className={styles.settingRow}>
          <span className={styles.label}>Likes</span>
       
          <Toggle checked={likes} onChange={setLikes} />
        </div>

        <div className={styles.settingRow}>
          <span className={styles.label}>Comments</span>
     
          <Toggle checked={comments} onChange={setComments} />
        </div>

        <div className={styles.settingRow}>
          <span className={styles.label}>New followers</span>
  
          <Toggle checked={newFollowers} onChange={setNewFollowers} />
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;