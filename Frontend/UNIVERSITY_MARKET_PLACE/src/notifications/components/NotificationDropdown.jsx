// src/notifications/components/NotificationDropdown.jsx
import { useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { Bell } from 'lucide-react';

export default function NotificationDropdown({ onClose }) {
  const { notifications, loading, markAllRead, unreadCount } = useNotifications();
  const ref = useRef();

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        )}

        {!loading && notifications.map(n => (
          <NotificationItem key={n._id} notification={n} />
        ))}
      </div>
    </div>
  );
}