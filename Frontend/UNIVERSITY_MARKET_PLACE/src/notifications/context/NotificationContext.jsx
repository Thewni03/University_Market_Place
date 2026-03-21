// src/notifications/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const NotificationContext = createContext();

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Get userId from your existing auth (localStorage token or user object)
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id || user?.id || null;
  } catch {
    return null;
  }
};

const getToken = () => localStorage.getItem('token') || null;

let socket;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [open, setOpen]                   = useState(false);

  const userId = getUserId();

  // Fetch all notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const token = getToken();
      const { data } = await axios.get(`${API_URL}/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: !token ? { userId } : {},
      });
      setNotifications(data.data || []);
      setUnreadCount((data.data || []).filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark one as read
  const markRead = useCallback(async (id) => {
    try {
      const token = getToken();
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: !token ? { userId } : {},
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [userId]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    try {
      const token = getToken();
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: !token ? { userId } : {},
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [userId]);

  // Delete one
  const deleteNotification = useCallback(async (id) => {
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: !token ? { userId } : {},
      });
      setNotifications(prev => {
        const removed = prev.find(n => n._id === id);
        if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n._id !== id);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [userId]);

  // Socket.io setup
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Connect socket
    socket = io(SOCKET_URL, { withCredentials: true });

    // Join private room
    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    // Listen for real-time notifications
    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket?.disconnect();
    };
  }, [userId, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, open, setOpen,
      markRead, markAllRead, deleteNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);