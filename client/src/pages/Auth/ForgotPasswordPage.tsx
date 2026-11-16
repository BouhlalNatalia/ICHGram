import React from 'react';
import { ForgotPasswordForm } from '../../features/auth';
import styles from './AuthPage.module.css';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className={styles.authContainer}>
      <main className={styles.main}>
        <ForgotPasswordForm />
      </main>
    </div>
  );
};

export default ForgotPasswordPage;