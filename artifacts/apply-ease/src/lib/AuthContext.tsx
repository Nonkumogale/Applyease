import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: { type: string; message: string } | null;
  authChecked: boolean;
  appPublicSettings: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  checkUserAuth: () => Promise<void>;
  checkAppState: () => Promise<void>;
  navigateToLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState<{ type: string; message: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      checkUserAuth();
    } else {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const checkAppState = async () => {
    // Simple app state check
    setIsLoadingPublicSettings(false);
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await apiClient.get('/auth/me');
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthChecked(true);
    } catch (error: any) {
      console.error('User auth check failed:', error);
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', {
        email,
        password
      });
      
      if (response.token) {
        localStorage.setItem('access_token', response.token);
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
      setAuthChecked(true);
    } catch (error: any) {
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Login failed'
      });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const response = await apiClient.post<{ user: User; token: string }>('/auth/register', userData);
      
      if (response.token) {
        localStorage.setItem('access_token', response.token);
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
      setAuthChecked(true);
      
      return response;
    } catch (error: any) {
      setAuthError({
        type: 'registration_failed',
        message: error.message || 'Registration failed'
      });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (e) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(false);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked,
      appPublicSettings,
      login,
      logout,
      register,
      checkUserAuth,
      checkAppState,
      navigateToLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
