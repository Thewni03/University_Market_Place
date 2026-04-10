import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Gift, MessageCircle, Settings, ShoppingCart, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const TYPE_ICONS = {
  order: { icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
  message: { icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
  promo: { icon: Gift, color: "text-amber-600", bg: "bg-amber-100" },
  system: { icon: Settings, color: "text-slate-600", bg: "bg-slate-100" },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${Math.max(diff, 1)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function NotificationPopupStack() {
  const navigate = useNavigate();
  const {
    popupNotifications,
    removePopupNotification,
    markRead,
  } = useNotifications();

  useEffect(() => {
    if (!popupNotifications.length) return undefined;

    const timers = popupNotifications.map((notification) =>
      window.setTimeout(() => {
        removePopupNotification(notification._id);
      }, 5000)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [popupNotifications, removePopupNotification]);

  const handleOpen = async (notification) => {
    removePopupNotification(notification._id);

    if (!notification.isRead) {
      await markRead(notification._id);
    }

    if (notification.type === "message" && notification.metadata?.senderId) {
      navigate("/dashboard", {
        state: {
          openChatUser: {
            _id: notification.metadata.senderId,
            fullname: notification.metadata.senderName || notification.title,
          },
        },
      });
    }
  };

  if (!popupNotifications.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[10020] flex w-[min(92vw,380px)] flex-col gap-3 sm:right-6">
      {popupNotifications.map((notification) => {
        const config = TYPE_ICONS[notification.type] || {
          icon: Bell,
          color: "text-primary",
          bg: "bg-primary/10",
        };
        const Icon = config.icon;

        return (
          <div
            key={notification._id}
            className="pointer-events-auto overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-md"
          >
            <div className="h-1.5 bg-[linear-gradient(90deg,_#25d366,_#4f46e5)]" />
            <div
              className="flex cursor-pointer items-start gap-3 px-4 py-4 transition hover:bg-slate-50"
              onClick={() => handleOpen(notification)}
            >
              <div className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl ${config.bg}`}>
                <Icon className={`size-5 ${config.color}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Notification</p>
                    <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">
                      {notification.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removePopupNotification(notification._id);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Dismiss notification"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {notification.body}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-400">
                    {timeAgo(notification.createdAt)}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    View
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
