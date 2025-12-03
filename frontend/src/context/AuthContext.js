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
      if (savedToken) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.data);
          setToken(savedToken);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
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
