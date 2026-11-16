import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useSetNewPassword } from '../../hooks/useSetNewPassword'; 
import styles from './SetNewPasswordForm.module.css';

const SetNewPasswordForm: React.FC = () => {

  const { token } = useParams<{ token: string }>();


  const { formData, isLoading, isSuccess, error, handleChange, handleSubmit } = useSetNewPassword(token || '');


  if (isSuccess) {
    return (
      <div className={styles.resetCard}>
        <div className={styles.iconCircleSuccess}>
          <ShieldCheck size={48} color="#22c55e" />
        </div>
        <h2 className={styles.title}>Password Changed!</h2>
        <p className={styles.description}>
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <div className={styles.footer}>
          <Link to="/login" className={styles.backToLoginBtn}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resetCard}>
      <div className={styles.iconCircle}>
        <ShieldCheck size={48} strokeWidth={1} />
      </div>

      <h2 className={styles.title}>Create New Password</h2>
      <p className={styles.description}>
        Please enter your new password below. Make sure it's secure.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
  
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
          disabled={isLoading}
        />

    
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={styles.input}
          required
          disabled={isLoading}
        />

   
        {error && <p className={styles.errorMessage}>{error}</p>}

        <button 
          type="submit" 
          className={styles.resetBtn} 
          disabled={isLoading || !formData.password || !formData.confirmPassword}
        >
          {isLoading ? 'Updating...' : 'Reset Password'}
        </button>
      </form>

      <div className={styles.footer}>
        <Link to="/login" className={styles.backToLogin}>
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default SetNewPasswordForm;