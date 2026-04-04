import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const NotificationContext = createContext();

const socket = io('http://localhost:5000', { withCredentials: true });

export function NotificationProvider({ children, userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);

  // Fetch existing notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notifications', { withCredentials: true });
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark one as read
  const markRead = useCallback(async (id) => {
    await axios.patch(`/api/notifications/${id}/read`, {}, { withCredentials: true });
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    await axios.patch('/api/notifications/read-all', {}, { withCredentials: true });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Delete one
  const deleteNotification = useCallback(async (id) => {
    await axios.delete(`/api/notifications/${id}`, { withCredentials: true });
    setNotifications(prev => {
      const removed = prev.find(n => n._id === id);
      if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
      return prev.filter(n => n._id !== id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Join the user's private socket room
    socket.emit('join', userId);

    // Listen for real-time notifications
    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.off('new_notification');
  }, [userId, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      markRead, markAllRead, deleteNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);