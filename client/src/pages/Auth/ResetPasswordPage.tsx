import React from 'react';
import { useParams } from 'react-router-dom';
import { SetNewPasswordForm } from '../../features/auth';
import styles from './AuthPage.module.css';

const ResetPasswordPage: React.FC = () => {
 
  const { token: _token } = useParams<{ token: string }>();

  return (
    <div className={styles.authContainer}>
      <main className={styles.main}>
        <SetNewPasswordForm />
      </main>
    </div>
  );
};

export default ResetPasswordPage;