import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import api from '../../../services/api'; 

export const useForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      // В режиме разработки сервер возвращает ссылку (письма не отправляются без SMTP)
      setDevResetUrl(data?.resetUrl ?? null);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return { email, isLoading, isSuccess, error, devResetUrl, handleChange, handleSubmit };
};