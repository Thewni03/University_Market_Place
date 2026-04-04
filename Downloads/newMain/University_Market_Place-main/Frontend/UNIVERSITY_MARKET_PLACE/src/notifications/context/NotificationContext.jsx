// src/notifications/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const NotificationContext = createContext();

const API_URL  = 'http://localhost:5001';
const SOCKET_URL = 'http://localhost:5001';

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id || user?.id || null;
  } catch { return null; }
};
const getToken = () => localStorage.getItem('token') || null;

let socket;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [open, setOpen]                   = useState(false);

  const userId   = getUserId();
  const location = useLocation();

  // Safely get selected chat user without crashing
  const getSelectedUserId = () => {
    try {
      const { useChatStore } = require('../../store/useChatStore');
      return useChatStore?.getState?.()?.selectedUser?._id || null;
    } catch { return null; }
  };

  const activeChatRef = useRef({ pathname: location.pathname, selectedUserId: null });

  useEffect(() => {
    activeChatRef.current = {
      pathname: location.pathname,
      selectedUserId: getSelectedUserId(),
    };
  }, [location.pathname]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const token = getToken();
      const { data } = await axios.get(`${API_URL}/api/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params:  !token ? { userId } : {},
      });

      const notifs = data.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally { setLoading(false); }
  }, [userId]);

  const markReadSilently = useCallback(async (id) => {
    try {
      const token = getToken();
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params:  !token ? { userId } : {},
      });
    } catch {}
  }, [userId]);

  const markRead = useCallback(async (id) => {
    try {
      const token = getToken();
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params:  !token ? { userId } : {},
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error('markRead error:', err); }
  }, [userId]);

  const markAllRead = useCallback(async () => {
    try {
      const token = getToken();
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params:  !token ? { userId } : {},
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error('markAllRead error:', err); }
  }, [userId]);

  const deleteNotification = useCallback(async (id) => {
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params:  !token ? { userId } : {},
      });
      setNotifications(prev => {
        const removed = prev.find(n => n._id === id);
        if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n._id !== id);
      });
    } catch (err) { console.error('deleteNotification error:', err); }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    socket = io(SOCKET_URL, { withCredentials: true });

    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    socket.on('new_notification', (notification) => {
      const senderId = notification?.metadata?.senderId;
      const isActiveChat =
        notification?.type === 'message' && senderId &&
        activeChatRef.current.pathname === '/dashboard' &&
        activeChatRef.current.selectedUserId?.toString() === senderId.toString();

      if (isActiveChat) {
        setNotifications(prev => [{ ...notification, isRead: true }, ...prev]);
        markReadSilently(notification._id);
        return;
      }

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => { socket?.disconnect(); };
  }, [userId, fetchNotifications, markReadSilently]);

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