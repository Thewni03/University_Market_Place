import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const { unreadCount, settings } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button 
        className={`relative p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none ${!settings?.enabled ? 'opacity-60' : 'opacity-100'}`}
        onClick={() => setOpen(prev => !prev)}
        title={settings?.enabled ? "Notifications On" : "Notifications Muted"}
      >

        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-gray-700"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>

          {!settings?.enabled && (
            <line x1="1" y1="1" x2="23" y2="23" className="stroke-red-500" strokeWidth="2" />
          )}
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>


      {open && (
        <div className="absolute right-0 z-50 mt-2">
          <NotificationDropdown onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
