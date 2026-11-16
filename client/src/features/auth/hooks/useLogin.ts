import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch } from '../../../hook/storeHooks';
import { setCredentials } from '../model/authSlice';
import { authService } from '../../../services/authService';
import type { IUser } from '../../../types/index';

interface UseLoginProps {
  onLoginSuccess?: (user: IUser) => void;
}
interface LoginResponse {
  user?: IUser;
  token: string;
  _id?: string; 
  username?: string;
}

export const useLogin = ({ onLoginSuccess }: UseLoginProps = {}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim();

   
      const data = (await authService.login({ email: cleanEmail, password })) as LoginResponse;

      if (!data.token) {
        throw new Error("Token not found in server response");
      }

   
      const userData = (data.user || data) as IUser;

      const authPayload = {
        user: userData,
        token: data.token
      };

      dispatch(setCredentials(authPayload));

      if (onLoginSuccess) onLoginSuccess(userData);
      
      navigate('/');
      
    } catch (err: unknown) {
   
      console.error("Ошибка входа:", err);
      
      let message = 'Invalid email or password';
      
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !email || password.length < 6 || isLoading;

  return {
    email, password, error, isLoading,
    handleEmailChange, handlePasswordChange, handleLogin, isButtonDisabled
  };
};