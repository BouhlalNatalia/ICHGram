import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import { Eye, EyeOff } from 'lucide-react';
import styles from './LoginForm.module.css';
import logo from '../../../../assets/icons/ichgram_seidbar.svg';
import type { IUser } from '../../../../types/index';

interface LoginFormProps {
  onLoginSuccess?: (user: IUser) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    email,
    password,
    error,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    isButtonDisabled
  } = useLogin({
    onLoginSuccess: (user) => {
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    }
  });

  return (
    <div className={styles.loginCard}>
      <img src={logo} alt="Ichgram" className={styles.logo} />

      <form className={styles.form} onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username, or email"
          className={styles.input}
          value={email}
          onChange={handleEmailChange}
          disabled={isLoading}
          required
        />


        <div className={styles.passwordInputContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={handlePasswordChange}
            disabled={isLoading}
            required
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className={styles.loginBtn}
          disabled={isButtonDisabled}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>

        <div className={styles.divider}>
          <div className={styles.line}></div>
          <span className={styles.or}>OR</span>
          <div className={styles.line}></div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.forgotContainer}>
          <Link to="/forgot-password" className={styles.forgotPassword}>
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;