import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      console.log('🚀 AuthContext initAuth:', { 
        hasSavedToken: !!savedToken,
        tokenPreview: savedToken?.substring(0, 20) + '...'
      });
      
      if (savedToken) {
        try {
          console.log('📡 Calling /auth/me with token...');
          const response = await authAPI.getMe();
          console.log('✅ /auth/me success:', response.data);
          setUser(response.data.data);
          setToken(savedToken);
        } catch (error) {
          console.error('❌ /auth/me failed:', error.response?.status, error.response?.data);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, recaptchaToken = null) => {
    const response = await authAPI.login({ email, password, recaptchaToken });
    const { user: userData, token: newToken } = response.data.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
    return userData;
  };

  const loginWithToken = (userData, newToken) => {
    console.log('🔐 loginWithToken called:', { 
      hasUser: !!userData, 
      hasToken: !!newToken,
      tokenPreview: newToken?.substring(0, 20) + '...'
    });
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { user: userData, token: newToken } = response.data.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithToken, register, logout, updateUser }}>
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
