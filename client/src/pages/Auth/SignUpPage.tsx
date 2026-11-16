import React from 'react';
import { Link } from 'react-router-dom';
import { SignUpForm } from '../../features/auth'; 
import styles from './AuthPage.module.css';
import type { IUser } from '../../types/index';

interface SignUpPageProps {

  onLoginSuccess?: (user: IUser) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onLoginSuccess }) => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.signupContent}>
   
        <SignUpForm onLoginSuccess={onLoginSuccess} /> 
        
        <div className={styles.switchBox}>
          <p>
            Have an account?{' '}
            <Link to="/login" className={styles.link}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;