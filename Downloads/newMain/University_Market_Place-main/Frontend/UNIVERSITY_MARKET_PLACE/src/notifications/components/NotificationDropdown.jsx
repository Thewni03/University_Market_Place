// src/notifications/components/NotificationDropdown.jsx
import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';

export default function NotificationDropdown({ onClose }) {
  const { notifications, loading, markAllRead, unreadCount } = useNotifications();
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const unread = notifications.filter(n => !n.isRead);
  const read   = notifications.filter(n => n.isRead);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        right: 0,
        top: '52px',
        width: '380px',
        maxHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(99,102,241,0.12)',
        borderRadius: '20px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.8) inset',
        zIndex: 9999,
        overflow: 'hidden',
        animation: 'notifSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      <style>{`
        @keyframes notifSlideIn {
          from { opacity:0; transform:translateY(-12px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes notifShimmer {
          from { background-position: -200% 0; }
          to   { background-position: 200% 0; }
        }
        .notif-item-enter {
          animation: notifItemIn 0.3s ease both;
        }
        @keyframes notifItemIn {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .notif-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        padding: '16px 18px 12px',
        background: 'linear-gradient(135deg, #6366f108 0%, #06b6d408 100%)',
        borderBottom: '1px solid rgba(99,102,241,0.08)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:32, height:32, borderRadius:10,
              background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>
              <Bell size={15} color="white"/>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Notifications</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>
                {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
              </div>
            </div>
            {unreadCount > 0 && (
              <div style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: 'white', fontSize:11, fontWeight:800,
                padding:'2px 8px', borderRadius:99,
                boxShadow:'0 2px 8px rgba(99,102,241,0.4)',
              }}>
                {unreadCount}
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                display:'flex', alignItems:'center', gap:5,
                background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)',
                borderRadius:8, padding:'5px 10px', cursor:'pointer',
                fontSize:11, fontWeight:600, color:'#6366f1',
                transition:'all 0.15s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.15)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(99,102,241,0.08)'}
            >
              <CheckCheck size={12}/>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="notif-scroll" style={{ overflowY:'auto', flex:1 }}>

        {loading && (
          <div style={{ padding:'32px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:'90%', height:56, borderRadius:12,
                background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
                backgroundSize:'200% 100%',
                animation:`notifShimmer 1.4s ease-in-out ${i*0.15}s infinite` }}/>
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div style={{ padding:'48px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <div style={{
              width:64, height:64, borderRadius:20,
              background:'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Sparkles size={28} color="#94a3b8"/>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#334155' }}>You're all caught up!</div>
              <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>New notifications will appear here</div>
            </div>
          </div>
        )}

        {!loading && unread.length > 0 && (
          <>
            <div style={{ padding:'8px 16px 4px',
              fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              New
            </div>
            {unread.map((n, i) => (
              <div key={n._id} className="notif-item-enter" style={{ animationDelay:`${i*0.05}s` }}>
                <NotificationItem notification={n}/>
              </div>
            ))}
          </>
        )}

        {!loading && read.length > 0 && (
          <>
            <div style={{ padding:'8px 16px 4px',
              fontSize:10, fontWeight:700, color:'#cbd5e1', letterSpacing:'0.1em', textTransform:'uppercase',
              borderTop: unread.length > 0 ? '1px solid #f1f5f9' : 'none',
              marginTop: unread.length > 0 ? 4 : 0,
            }}>
              Earlier
            </div>
            {read.map((n, i) => (
              <div key={n._id} className="notif-item-enter" style={{ animationDelay:`${i*0.03}s` }}>
                <NotificationItem notification={n}/>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      {notifications.length > 0 && (
        <div style={{
          padding:'10px 16px',
          borderTop:'1px solid rgba(99,102,241,0.08)',
          background:'rgba(248,250,252,0.8)',
          textAlign:'center',
        }}>
          <a href="/notifications" style={{ fontSize:12, fontWeight:600, color:'#6366f1',
            textDecoration:'none', opacity:0.8 }}
            onMouseEnter={e=>e.currentTarget.style.opacity='1'}
            onMouseLeave={e=>e.currentTarget.style.opacity='0.8'}>
            View all notifications →
          </a>
        </div>
      )}
    </div>
  );
}