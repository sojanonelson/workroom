import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('workroom_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('workroom_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('workroom_token', newToken);
    localStorage.setItem('workroom_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('workroom_token');
    localStorage.removeItem('workroom_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      if (token) {
        const freshUser = await authApi.getMe();
        setUser(freshUser);
        localStorage.setItem('workroom_user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('workroom_token');
      if (storedToken) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
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
