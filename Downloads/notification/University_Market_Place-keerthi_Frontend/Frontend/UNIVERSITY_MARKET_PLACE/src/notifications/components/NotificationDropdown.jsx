import { useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({ onClose }) {
  const { notifications, loading, markAllRead } = useNotifications();
  const ref = useRef();

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="notif-dropdown" ref={ref}>
      {/* Header */}
      <div className="notif-header">
        <span>Notifications</span>
        <button onClick={markAllRead}>Mark all read</button>
      </div>

      {/* List */}
      <div className="notif-list">
        {loading && <p className="notif-empty">Loading...</p>}

        {!loading && notifications.length === 0 && (
          <p className="notif-empty">You're all caught up! 🎉</p>
        )}

        {!loading && notifications.map(n => (
          <NotificationItem key={n._id} notification={n} />
        ))}
      </div>
    </div>
  );
}