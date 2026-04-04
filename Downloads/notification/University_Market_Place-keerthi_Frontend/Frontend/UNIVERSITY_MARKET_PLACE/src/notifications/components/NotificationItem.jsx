import { useNotifications } from '../context/NotificationContext';

const TYPE_ICONS = {
  order:   '🛒',
  message: '💬',
  promo:   '🎁',
  system:  '⚙️',
};

export default function NotificationItem({ notification }) {
  const { markRead, deleteNotification } = useNotifications();
  const { _id, type, title, body, isRead, createdAt } = notification;

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      className={`notif-item ${!isRead ? 'notif-unread' : ''}`}
      onClick={() => !isRead && markRead(_id)}
    >
      <span className="notif-icon">{TYPE_ICONS[type] || '🔔'}</span>

      <div className="notif-content">
        <p className="notif-title">{title}</p>
        <p className="notif-body">{body}</p>
        <span className="notif-time">{timeAgo(createdAt)}</span>
      </div>

      <button
        className="notif-delete"
        onClick={(e) => { e.stopPropagation(); deleteNotification(_id); }}
      >✕</button>
    </div>
  );
}