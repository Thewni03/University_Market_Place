import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { Bell, Settings2, BellOff, BellRing } from 'lucide-react';

export default function NotificationDropdown({ onClose }) {
  const { notifications, loading, markAllRead, unreadCount, settings, updateSettings } = useNotifications();
  const ref = useRef();


  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleToggleMute = (e) => {
    e.stopPropagation();
    updateSettings({ ...settings, enabled: !settings.enabled });
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
    >

      <div className="flex flex-col border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-gray-100/50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {settings?.enabled ? (
              <BellRing className="h-3 w-3 text-green-500" />
            ) : (
              <BellOff className="h-3 w-3 text-red-500" />
            )}
            <span className="text-[11px] font-medium text-gray-600 dark:text-zinc-400">
              {settings?.enabled ? "Alerts Enabled" : "Alerts Muted"}
            </span>
          </div>
          

          <button
            onClick={handleToggleMute}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              settings?.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                settings?.enabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>


      <div className="max-h-[28rem] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
            <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">You're all caught up!</p>
              <p className="text-xs text-gray-500">New alerts will appear here even if muted.</p>
            </div>
          </div>
        )}

        {!loading && notifications.map(n => (
          <NotificationItem key={n._id} notification={n} />
        ))}
      </div>
    </div>
  );
}
