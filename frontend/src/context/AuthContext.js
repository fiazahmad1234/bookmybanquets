import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('bmb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bmb_token');
      localStorage.removeItem('bmb_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export { API };

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bmb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('bmb_token', res.data.token);
    localStorage.setItem('bmb_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await API.post('/auth/register', data);
    localStorage.setItem('bmb_token', res.data.token);
    localStorage.setItem('bmb_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('bmb_token');
    localStorage.removeItem('bmb_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    localStorage.setItem('bmb_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {}
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, notifications, unreadCount, fetchNotifications }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
