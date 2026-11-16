import React, { useState } from 'react';
import { useSignUp } from '../../hooks/useSignUp';
import { Eye, EyeOff } from 'lucide-react'; 
import styles from './SignUpForm.module.css';
import logo from '../../../../assets/icons/ichgram_seidbar.svg';
import type { IUser } from '../../../../types/index';

interface SignUpFormProps {
  onLoginSuccess?: (user: IUser) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false); 

  const { 
    formData, 
    error, 
    isLoading, 
    handleChange, 
    handleSubmit, 
    isButtonDisabled 
  } = useSignUp({ 
    onLoginSuccess: (user) => {
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } 
  });

  return (
    <div className={styles.container}>
      <img src={logo} alt="Ichgram" className={styles.logo} />
      
      <p className={styles.subtitle}>
        Sign up to see photos and videos from your friends.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className={styles.input}
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          className={styles.input}
          value={formData.fullName}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          className={styles.input}
          value={formData.username}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        
     
        <div className={styles.passwordInputContainer}>
          <input
            type={showPassword ? 'text' : 'password'} 
            name="password"
            placeholder="Password"
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
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

        <div className={styles.termsBox}>
          <p className={styles.termsText}>
            People who use our service may have uploaded your contact information to Instagram. <a href="#">Learn More</a>
          </p>
          <p className={styles.termsText}>
            By signing up, you agree to our <a href="#">Terms</a> , <a href="#">Privacy Policy</a> and <a href="#">Cookies Policy</a> .
          </p>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isButtonDisabled}
        >
          {isLoading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;