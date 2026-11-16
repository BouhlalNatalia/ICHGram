import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../../features/auth';
import styles from './AuthPage.module.css';
import type { IUser } from '../../types/index';
import phonesImg from '../../assets/images/Main_Background.png';

interface LoginPageProps {
  onLoginSuccess?: (user: IUser) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>

        <div className={styles.phonesContainer}>
          <img
            src={phonesImg}
            alt="App screenshots"
            className={styles.phonesImage}
          />
        </div>

        <div className={styles.formColumn}>

          <LoginForm onLoginSuccess={onLoginSuccess} />



          <div className={styles.switchBox}>
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className={styles.link}>
                Sign up
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;