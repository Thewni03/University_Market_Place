import React, { Suspense, createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';

const NotificationPopupStack = React.lazy(() => import('../components/NotificationPopupStack'));

const NotificationContext = createContext();

const API_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id || user?.id || null;
  } catch { return null; }
};

const getToken = () => localStorage.getItem('token') || null;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [open, setOpen]                   = useState(false);
  const [popupNotifications, setPopupNotifications] = useState([]);
  const [settings, setSettings]           = useState({ enabled: true });

  const userId = getUserId();
  const location = useLocation();
  const selectedUser = useChatStore((state) => state.selectedUser);
  
  const activeChatRef = useRef({ pathname: location.pathname, selectedUserId: selectedUser?._id || null });
  const socketRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = {
      pathname: location.pathname,
      selectedUserId: selectedUser?._id || null,
    };
  }, [location.pathname, selectedUser?._id]);

  /*
  const fetchNotifications = useCallback(async () => {
    const currentUserId = getUserId();
    const token = getToken();

    if (!currentUserId || !token) {
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Notification History
      const { data } = await axios.get(`${API_URL}/notifications`, { headers });
      setNotifications(data.data || []);
      setUnreadCount((data.data || []).filter(n => !n.isRead).length);

      // 2. Fetch User Profile/Settings (Corrected endpoint)
      const userRes = await axios.get(`${API_URL}/users/profile`, { headers });
      if (userRes.data?.notificationSettings) {
        setSettings(userRes.data.notificationSettings);
      }
    } catch (err) {
      console.error('❌ Sync Error:', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  */
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!userId || !token) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const { data } = await axios.get(`${API_URL}/notifications`, { headers });
      setNotifications(data.data || []);
      setUnreadCount((data.data || []).filter(n => !n.isRead).length);
  
      const localUser = JSON.parse(localStorage.getItem('user'));
      setSettings(localUser?.notificationSettings || { enabled: true });
  
    } catch (err) {
      if (err.response?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Failed to fetch notifications:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

const updateSettings = useCallback(async (newSettings) => {
  try {
    const token = getToken();
    // CHANGED: Use /users/settings to match your server.js mount point
    await axios.patch(`http://localhost:5001/users/settings`, { 
      notificationSettings: newSettings 
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setSettings(newSettings);
  } catch (err) {
    console.error('Failed to update settings:', err);
  }
}, []);


  // --- NOTIFICATION ACTIONS ---
  const markReadSilently = useCallback(async (id) => {
    try {
      const token = getToken();
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) { console.error(err); }
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      const token = getToken();
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const token = getToken();
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(prev => {
        const removed = prev.find(n => n._id === id);
        if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n._id !== id);
      });
    } catch (err) { console.error(err); }
  }, []);

  const removePopupNotification = useCallback((id) => {
    setPopupNotifications((prev) => prev.filter((n) => n._id !== id));
  }, []);

//socket
  useEffect(() => {
    const currentUserId = getUserId();
    const token = getToken();

    if (!currentUserId || !token) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    fetchNotifications();

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('Notification Socket Connected');

        socketRef.current.emit('setup', currentUserId);
        socketRef.current.emit('join', currentUserId);
      });

      socketRef.current.on('new_notification', (notification) => {
        const senderId = notification?.metadata?.senderId;
        const isCurrentChat = 
          notification.type === 'message' && 
          senderId && 
          activeChatRef.current.selectedUserId === senderId;

        if (isCurrentChat) {
          setNotifications(prev => [{ ...notification, isRead: true }, ...prev]);
          markReadSilently(notification._id);
          return;
        }

        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        

        if (settings.enabled) {
          setPopupNotifications((prev) => {
            const filtered = prev.filter((item) => item._id !== notification._id);
            return [notification, ...filtered].slice(0, 3);
          });
        }
      });
    }

    return () => {
      if (socketRef.current && (!currentUserId || userId !== currentUserId)) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, fetchNotifications, markReadSilently, settings.enabled]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, open, setOpen,
      popupNotifications, removePopupNotification,
      markRead, markAllRead, deleteNotification,
      settings, updateSettings
    }}>
      {children}
      {settings.enabled && popupNotifications.length > 0 && (
        <Suspense fallback={null}>
          <NotificationPopupStack />
        </Suspense>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
