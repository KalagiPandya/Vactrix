import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

import { API, SOCKET_URL } from '../config/api';

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [connected,     setConnected]     = useState(false);
  const pollRef = useRef(null);

  const h = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/notifications?limit=30`, { headers: h() });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, [token, h]);

  // Try to load socket.io-client dynamically; fall back to polling
  useEffect(() => {
    if (!token || !user) return;

    let socket = null;
    let cleanup = () => {};

    const trySocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });
        socket.on('connect', () => {
          setConnected(true);
          socket.emit('register', user.id || user._id);
        });
        socket.on('disconnect', () => setConnected(false));
        socket.on('notification', (notif) => {
          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
        cleanup = () => socket.disconnect();
      } catch {
        // socket.io-client not installed — use polling every 30s
        loadNotifications();
        pollRef.current = setInterval(loadNotifications, 30000);
        cleanup = () => clearInterval(pollRef.current);
      }
    };

    trySocket();
    return () => cleanup();
  }, [token, user, loadNotifications]);

  useEffect(() => {
    if (token) loadNotifications();
    else { setNotifications([]); setUnreadCount(0); }
  }, [token, loadNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await axios.patch(`${API}/notifications/${id}/read`, {}, { headers: h() });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  }, [h]);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch(`${API}/notifications/mark-all-read`, {}, { headers: h() });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  }, [h]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await axios.delete(`${API}/notifications/${id}`, { headers: h() });
      setNotifications(prev => {
        const notif = prev.find(n => n._id === id);
        if (notif && !notif.isRead) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n._id !== id);
      });
    } catch { /* silent */ }
  }, [h]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, connected,
      loadNotifications, markAsRead, markAllAsRead, deleteNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
