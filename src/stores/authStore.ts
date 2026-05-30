import { create } from 'zustand';
import { User } from '../types';
import { authApi, setToken, clearToken } from '../utils/api';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 初始化
  initialize: () => void;

  // 用户注册
  register: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;

  // 用户登录
  login: (name: string, role: 'student' | 'teacher', password: string) => Promise<{ success: boolean; error?: string }>;

  // 用户登出
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    // 从localStorage恢复登录状态
    const token = localStorage.getItem('artwork_token');
    const userStr = localStorage.getItem('artwork_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          currentUser: user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        clearToken();
        localStorage.removeItem('artwork_user');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  register: async (name, password) => {
    try {
      const result = await authApi.register(name, password);
      
      if (result.success && result.data) {
        const { user, token } = result.data;
        
        // 保存到localStorage
        setToken(token);
        localStorage.setItem('artwork_user', JSON.stringify(user));
        
        set({
          currentUser: user as User,
          isAuthenticated: true
        });
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: '注册失败，请重试' };
    }
  },

  login: async (name, role, password) => {
    try {
      const result = await authApi.login(name, role, password);
      
      if (result.success && result.data) {
        const { user, token } = result.data;
        
        // 保存到localStorage
        setToken(token);
        localStorage.setItem('artwork_user', JSON.stringify(user));
        
        set({
          currentUser: user as User,
          isAuthenticated: true
        });
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: '登录失败，请重试' };
    }
  },

  logout: () => {
    clearToken();
    localStorage.removeItem('artwork_user');
    set({
      currentUser: null,
      isAuthenticated: false
    });
  }
}));
