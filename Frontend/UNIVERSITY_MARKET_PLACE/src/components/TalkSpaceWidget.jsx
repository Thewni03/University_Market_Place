import React, { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircleMore, Minimize2, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import ChatWorkspace from "./ChatWorkspace";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const HIDDEN_ROUTES = new Set(["/", "/login", "/register", "/verificationstatushandler", "/pending"]);

const TalkSpaceWidget = () => {
  const location = useLocation();
  const authUser = useAuthStore((state) => state.authUser);
  const users = useChatStore((state) => state.users);
  const getUsers = useChatStore((state) => state.getUsers);
  const isLoadingUsers = useChatStore((state) => state.isLoadingUsers);
  const [isOpen, setIsOpen] = useState(false);
  const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const shouldHide = HIDDEN_ROUTES.has(normalizedPath) || normalizedPath === "/dashboard" || !authUser?._id;
  const totalUnread = useMemo(
    () => users.reduce((sum, user) => sum + Number(user?.unreadCount || 0), 0),
    [users]
  );

  useEffect(() => {
    if (shouldHide) {
      setIsOpen(false);
    }
  }, [shouldHide]);

  useEffect(() => {
    if (!authUser?._id) return;
    getUsers();
  }, [authUser?._id, getUsers]);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div id="talk-space-popup" className="fixed bottom-32 right-4 z-[9997] h-[min(76vh,720px)] w-[min(94vw,860px)] sm:bottom-36 sm:right-6">
          <div className="flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-[linear-gradient(180deg,_#f9fbfa,_#eef3f0)] shadow-[0_26px_90px_rgba(15,23,42,0.20)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Talk Space</p>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">Quick conversations</h2>
                  {isLoadingUsers ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      <Loader2 className="size-3 animate-spin" />
                      Loading
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  aria-label="Minimize Talk Space"
                >
                  <Minimize2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  aria-label="Close Talk Space"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 p-3">
              <ChatWorkspace compact />
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group fixed bottom-20 right-4 z-[9998] overflow-hidden rounded-[28px] border px-4 py-3 text-left text-white transition-all duration-300 sm:bottom-24 sm:right-6 ${
          isOpen
            ? "border-emerald-200/70 bg-[linear-gradient(135deg,_#123c31,_#1a5b48)] shadow-[0_22px_55px_rgba(18,60,49,0.35)]"
            : "border-white/20 bg-[linear-gradient(135deg,_#0f3d2e,_#1d6b52)] shadow-[0_20px_50px_rgba(15,61,46,0.30)] hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(15,61,46,0.38)]"
        }`}
        aria-expanded={isOpen}
        aria-controls="talk-space-popup"
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_42%)]" />
          <span className="relative flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/12 shadow-inner shadow-white/10 backdrop-blur-sm">
              {isLoadingUsers ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <MessageCircleMore className="size-5" />
              )}
            </span>

            <span className="flex flex-col">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-emerald-100/90">
                <span className="inline-flex size-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
              {isLoadingUsers ? "Loading" : "Live Chat"}
              </span>
              <span className="mt-1 text-sm font-semibold tracking-[0.01em]">
              {isLoadingUsers
                ? "Loading conversations..."
                : isOpen
                  ? "Talk Space Open"
                  : "Open Talk Space"}
              </span>
            </span>
          </span>

        {totalUnread > 0 && !isOpen ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-7 items-center justify-center rounded-full border-2 border-white bg-[#25d366] px-2 py-1 text-[11px] font-bold leading-none text-white shadow-[0_10px_24px_rgba(37,211,102,0.45)]">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        ) : null}
      </button>
    </>
  );
};

export default TalkSpaceWidget;
