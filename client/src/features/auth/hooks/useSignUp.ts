import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { authService } from '../../../services/authService';
import { useAppDispatch } from '../../../hook/storeHooks';
import { setCredentials } from '../model/authSlice';
import type { IUser } from '../../../types/index';

interface UseSignUpProps {
  onLoginSuccess: (user: IUser) => void;
}

interface RegisterResponse {
  user?: IUser;
  token?: string;
  _id?: string; 
  username?: string;
}

export const useSignUp = ({ onLoginSuccess }: UseSignUpProps) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {

      const data = await authService.register(formData) as RegisterResponse;
      
        const userData = (data.user || data) as IUser;

      if (userData && userData._id && data.token) {
        // setCredentials кладёт пользователя в Redux и localStorage -> маршруты сразу становятся доступны
        dispatch(setCredentials({ user: userData, token: data.token }));

        onLoginSuccess(userData);
        navigate('/');
      } else {
        console.warn("User ID not found in response");
        navigate('/login');
      }
    } catch (err: unknown) {
   
      console.error('Registration failed:', err);
      
      let message = 'Registration failed. Please try again.';
      
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = 
    !formData.email || 
    !formData.username || 
    formData.password.length < 6 || 
    isLoading;

  return {
    formData,
    error,
    isLoading,
    handleChange,
    handleSubmit,
    isButtonDisabled
  };
};