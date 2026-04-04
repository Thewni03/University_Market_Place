// src/notifications/components/NotificationItem.jsx
import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, MessageCircle, Gift, Settings,
  Bell, Star, TrendingUp, Zap, Award, X
} from 'lucide-react';

// ── Rich notification config per type ────────────────────────────
const TYPE_CONFIG = {
  order: {
    icon: ShoppingCart,
    gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
    glow: 'rgba(59,130,246,0.25)',
    bg: 'rgba(59,130,246,0.06)',
    dot: '#3b82f6',
  },
  message: {
    icon: MessageCircle,
    gradient: 'linear-gradient(135deg,#10b981,#06b6d4)',
    glow: 'rgba(16,185,129,0.25)',
    bg: 'rgba(16,185,129,0.06)',
    dot: '#10b981',
  },
  promo: {
    icon: Gift,
    gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    glow: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.06)',
    dot: '#f59e0b',
  },
  system: {
    icon: Settings,
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    glow: 'rgba(99,102,241,0.25)',
    bg: 'rgba(99,102,241,0.06)',
    dot: '#6366f1',
  },
  review: {
    icon: Star,
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    glow: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.06)',
    dot: '#f59e0b',
  },
  trending: {
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg,#ec4899,#8b5cf6)',
    glow: 'rgba(236,72,153,0.25)',
    bg: 'rgba(236,72,153,0.06)',
    dot: '#ec4899',
  },
  achievement: {
    icon: Award,
    gradient: 'linear-gradient(135deg,#f59e0b,#eab308)',
    glow: 'rgba(245,158,11,0.3)',
    bg: 'rgba(245,158,11,0.08)',
    dot: '#f59e0b',
  },
  booking: {
    icon: Zap,
    gradient: 'linear-gradient(135deg,#6366f1,#06b6d4)',
    glow: 'rgba(99,102,241,0.25)',
    bg: 'rgba(99,102,241,0.06)',
    dot: '#6366f1',
  },
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
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const config = TYPE_CONFIG[type] || {
    icon: Bell,
    gradient: 'linear-gradient(135deg,#64748b,#94a3b8)',
    glow: 'rgba(100,116,139,0.2)',
    bg: 'rgba(100,116,139,0.06)',
    dot: '#64748b',
  };
  const Icon = config.icon;

  const handleClick = () => {
    if (!isRead) markRead(_id);
    if (type === 'message' && metadata?.senderId) {
      navigate('/dashboard', { state: { openChatUser: { _id: metadata.senderId, fullname: metadata.senderName || title } } });
    } else if (metadata?.serviceId) {
      navigate(`/service/${metadata.serviceId}`);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await deleteNotification(_id);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: hovered
          ? (isRead ? 'rgba(248,250,252,0.8)' : config.bg)
          : (!isRead ? `${config.bg}` : 'transparent'),
        borderBottom: '1px solid rgba(241,245,249,0.8)',
        position: 'relative',
        opacity: deleting ? 0 : 1,
        transform: deleting ? 'translateX(20px)' : 'translateX(0)',
      }}
    >
      {/* Unread left bar */}
      {!isRead && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 3, borderRadius: '0 2px 2px 0',
          background: config.dot,
        }}/>
      )}

      {/* Icon */}
      <div style={{
        flexShrink: 0,
        width: 40, height: 40, borderRadius: 12,
        background: config.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: hovered ? `0 6px 16px ${config.glow}` : `0 2px 8px ${config.glow}`,
        transition: 'box-shadow 0.2s ease',
      }}>
        <Icon size={18} color="white"/>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:4 }}>
          <p style={{
            fontSize: 13,
            fontWeight: isRead ? 500 : 700,
            color: isRead ? '#475569' : '#0f172a',
            lineHeight: 1.3,
            margin: 0,
          }}>
            {title}
          </p>
          {!isRead && (
            <div style={{
              flexShrink: 0,
              width: 8, height: 8, borderRadius: '50%',
              background: config.dot,
              marginTop: 4,
              boxShadow: `0 0 6px ${config.glow}`,
            }}/>
          )}
        </div>
        <p style={{
          fontSize: 12,
          color: '#94a3b8',
          marginTop: 3,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {body}
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5 }}>
          <div style={{ width:4, height:4, borderRadius:'50%', background:config.dot, opacity:0.6 }}/>
          <span style={{ fontSize:10, color:'#cbd5e1', fontWeight:500 }}>{timeAgo(createdAt)}</span>
          {metadata?.serviceId && (
            <span style={{
              fontSize:10, color:config.dot, fontWeight:600,
              background:`${config.dot}12`, padding:'1px 6px', borderRadius:99,
            }}>
              View service →
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        style={{
          flexShrink: 0,
          width: 24, height: 24, borderRadius: 6,
          background: hovered ? 'rgba(239,68,68,0.08)' : 'transparent',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transition: 'all 0.15s',
        }}
      >
        <X size={12} color="#ef4444"/>
      </button>
    </div>
  );
}