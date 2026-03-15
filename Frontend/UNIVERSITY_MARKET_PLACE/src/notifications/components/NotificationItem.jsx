// src/notifications/components/NotificationItem.jsx
import React from "react";
import { useNotifications } from '../context/NotificationContext';
import { X, ShoppingCart, MessageCircle, Gift, Settings, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS = {
  order:   { icon: ShoppingCart, color: 'text-blue-500',  bg: 'bg-blue-500/10'   },
  message: { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10'  },
  promo:   { icon: Gift,          color: 'text-amber-500', bg: 'bg-amber-500/10'  },
  system:  { icon: Settings,      color: 'text-purple-500',bg: 'bg-purple-500/10' },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function NotificationItem({ notification }) {
  const navigate = useNavigate();
  const { markRead, deleteNotification } = useNotifications();
  const { _id, type, title, body, isRead, createdAt, metadata } = notification;

  const config = TYPE_ICONS[type] || { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' };
  const Icon = config.icon;

  const handleOpen = () => {
    if (!isRead) {
      markRead(_id);
    }

    if (type === 'message' && metadata?.senderId) {
      navigate('/dashboard', {
        state: {
          openChatUser: {
            _id: metadata.senderId,
            fullname: metadata.senderName || title,
          },
        },
      });
    }
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0 group
        ${!isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/50'}`}
      onClick={handleOpen}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5 ${config.bg}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${!isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
            {title}
          </p>
          {/* Unread dot */}
          {!isRead && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-accent mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{body}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(createdAt)}</p>
      </div>

      {/* Delete button */}
      <button
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 h-6 w-6 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-all"
        onClick={(e) => { e.stopPropagation(); deleteNotification(_id); }}
      >
        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}
