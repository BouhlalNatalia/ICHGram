import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../hooks/useForgotPassword'; 
import styles from './ForgotPasswordForm.module.css';

const ForgotPasswordForm: React.FC = () => {
 
  const { email, isLoading, isSuccess, error, devResetUrl, handleChange, handleSubmit } = useForgotPassword();

  if (isSuccess) {
    return (
      <div className={styles.resetCard}>
        <h2 className={styles.title}>Email Sent!</h2>
        <p className={styles.description}>
          We've sent a link to <strong>{email}</strong> to get back into your account.
        </p>
        {devResetUrl && (
          <p className={styles.description}>
            Dev mode: <Link to={new URL(devResetUrl).pathname}>open reset link</Link>
          </p>
        )}
        <div className={styles.footer}>
          <Link to="/login" className={styles.backToLogin}>Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resetCard}>
      <div className={styles.iconCircle}>
        <Lock size={48} strokeWidth={1} />
      </div>

      <h2 className={styles.title}>Trouble logging in?</h2>
      <p className={styles.description}>
        Enter your email, phone, or username and we'll send you a link to get back into your account.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="email"
          placeholder="Email or Username"
          value={email}
          onChange={handleChange}
          className={styles.input}
          required
          disabled={isLoading}
        />
        {error && <p className={styles.description}>{error}</p>}
        <button type="submit" className={styles.resetBtn} disabled={isLoading || !email}>
          {isLoading ? 'Sending...' : 'Reset your password'}
        </button>
      </form>

      <div className={styles.separator}>
        <div className={styles.line} />
        <span className={styles.orText}>OR</span>
        <div className={styles.line} />
      </div>

      <Link to="/signup" className={styles.createAccountLink}>
        Create new account
      </Link>

      <div className={styles.footer}>
        <Link to="/login" className={styles.backToLogin}>
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;