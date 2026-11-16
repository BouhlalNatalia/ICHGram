import api from './api'; 
import type { 
  AuthResponse, 
  RegisterData, 
  LoginCredentials, 
  ChangePasswordData 
} from '../types/index';

export const authService = {
  async register(userData: RegisterData): Promise<AuthResponse> { 
    // Сервер возвращает плоский объект пользователя + token.
    // В localStorage/Redux данные кладёт authSlice.setCredentials.
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {

    const response = await api.put('/users/change-password', data);
    return response.data;
  }
};