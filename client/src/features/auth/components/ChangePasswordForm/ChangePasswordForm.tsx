import React, { useState } from 'react';
import axios from 'axios';
import api from '../../../../services/api';
import styles from './ChangePasswordForm.module.css';

export const ChangePasswordForm: React.FC = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/users/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      alert('Password changed successfully');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {

      let msg = 'Error updating password';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Change Password</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          <label>Current Password</label>
          <input
            type="password"
            name="oldPassword" 
            placeholder="Current Password"
            value={passwords.oldPassword}
            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
            required
          />
        </div>

        <div className={styles.inputWrapper}>
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            required
          />
        </div>

        <div className={styles.inputWrapper}>
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            required
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};
export default ChangePasswordForm;