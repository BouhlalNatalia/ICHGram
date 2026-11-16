import React, { useState } from 'react';
import Toggle from '../../../../components/ui/Toggle/Toggle';
import styles from './PrivacySettings.module.css';

const PrivacySettings: React.FC = () => {
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Privacy and security</h1>

      <div className={styles.section}>
        <div className={styles.settingHeader}>
          <h2 className={styles.sectionTitle}>Account Privacy</h2>
     
          <Toggle 
            checked={isPrivate} 
            onChange={setIsPrivate} 
          />
        </div>

        <div className={styles.infoBox}>
          <p className={styles.settingName}>Private account</p>
          <p className={styles.hint}>
            When your account is private, only people you approve can see your photos and videos. 
            Your existing followers won't be affected.
          </p>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data security</h2>
        <button className={styles.linkBtn}>Two-factor authentication</button>
        <button className={styles.linkBtn}>View login activity</button>
      </div>
    </div>
  );
};

export default PrivacySettings;