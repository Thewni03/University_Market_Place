import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/sidebarSkeletons.jsx";
import { Search, Sparkles, Users } from "lucide-react";

const getUserAvatar = (user) => user?.profilePic || user?.profile_picture || "/avatar.png";
const normalizeId = (value) => (value ? value.toString() : "");

const Sidebar = ({ compact = false }) => {
  const { getUsers, users, selectedUser, setSelecteduser, isUsersLoading } = useChatStore();

  const { authUser, onlineusers: onlineUsers = [] } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const onlineUserIds = new Set((onlineUsers || []).map((userId) => normalizeId(userId)));

  useEffect(() => {
    if (!authUser?._id) return;
    getUsers();
  }, [authUser?._id, getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = !showOnlineOnly || onlineUserIds.has(normalizeId(user._id));
    const displayName = (user.fullName || user.fullname || "Unknown User").toLowerCase();
    const matchesSearch = displayName.includes(searchTerm.trim().toLowerCase());
    return matchesOnline && matchesSearch;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className={`h-full border-r border-slate-200/80 bg-[linear-gradient(180deg,_#f3f7f4,_#eaf1ed)] ${compact ? "w-[156px] sm:w-[190px]" : "w-20 rounded-l-[28px] sm:w-24 lg:w-[340px]"}`}>
      <div className="flex h-full flex-col">
        <div className={`border-b border-slate-200 ${compact ? "p-3" : "p-4 lg:p-6"}`}>
          <div className={`flex items-center ${compact ? "justify-between gap-2" : "justify-center lg:justify-between"}`}>
            <div className={compact ? "min-w-0" : "hidden lg:block"}>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Conversations
              </p>
              <h2 className={`mt-2 font-semibold text-slate-900 ${compact ? "text-base" : "text-2xl"}`}>People</h2>
            </div>
            <div className={`flex items-center justify-center rounded-2xl bg-[#4a4e69]/10 text-[#4a4e69] shadow-sm ${compact ? "size-10" : "size-12"}`}>
              <Users className={compact ? "size-5" : "size-6"} />
            </div>
          </div>

          <div className={`mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-3 ${compact ? "block" : "hidden lg:block"}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Active now
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {Math.max(onlineUserIds.size - 1, 0)} people ready to chat right now.
                </p>
              </div>
            </div>
          </div>

          <div className={`mt-4 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 ${compact ? "hidden" : "hidden lg:flex"}`}>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm border-slate-300 [--chkbg:#10b981] [--chkfg:#ffffff]"
              />
              <span>Show online only</span>
            </label>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
              {filteredUsers.length} shown
            </span>
          </div>

          <div className={`mt-4 ${compact ? "hidden" : "hidden lg:block"}`}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search people"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        </div>

        <div className={`overflow-y-auto px-2 py-3 ${compact ? "" : "lg:px-3"}`}>
          {filteredUsers.map((user) => {
            const displayName = user.fullName || user.fullname || "Unknown User";
            const isOnline = onlineUserIds.has(normalizeId(user._id));
            const isSelected = selectedUser?._id === user._id;
            const unreadCount = Number(user.unreadCount || 0);
            const hasUnread = unreadCount > 0 && !isSelected;
            const previewText = user.lastMessage || (isOnline ? "Available to reply" : "Last seen recently");

            return (
              <button
                key={user._id}
                onClick={() => setSelecteduser(user)}
                className={`
                  mb-2 flex w-full items-center gap-3 rounded-3xl border border-transparent px-3 text-left transition-all duration-200
                  ${compact ? "min-h-[70px] py-2.5" : "min-h-[78px] py-3"}
                  ${isSelected
                    ? "border-emerald-200 bg-[#e1efe7] shadow-sm"
                    : hasUnread
                      ? "bg-[#edf6f1] ring-1 ring-emerald-100 hover:bg-[#e7f2ec]"
                      : "hover:bg-slate-50"
                  }
                `}
              >
                <div className={`relative shrink-0 ${compact ? "" : "mx-auto lg:mx-0"}`}>
                  <img
                    src={getUserAvatar(user)}
                    alt={displayName}
                    className={`${compact ? "size-11" : "size-12"} rounded-2xl object-cover ring-1 ring-slate-200`}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#25d366] px-1.5 py-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  {isOnline && (
                    <span
                      className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-white"
                    />
                  )}
                </div>

                <div className={`min-w-0 flex-1 ${compact ? "block" : "hidden lg:block"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className={`truncate font-medium text-slate-800 ${hasUnread || isSelected ? "font-semibold text-slate-900" : ""}`}>{displayName}</div>
                    {hasUnread ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#25d366] px-2 py-1 text-[11px] font-bold leading-none text-white shadow-sm">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    ) : (
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${isSelected ? "bg-emerald-100 text-emerald-700" : isOnline ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                        {isSelected ? "Open" : isOnline ? "Online" : "Offline"}
                      </span>
                    )}
                  </div>
                  <div className={`mt-1 truncate ${compact ? "text-xs" : "text-sm"} ${hasUnread ? "font-semibold text-slate-700" : isSelected ? "text-slate-600" : "text-slate-500"}`}>
                    {previewText}
                  </div>
                </div>
              </button>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="mx-2 mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {authUser?._id ? "No matching users right now." : "Log in to load your conversations."}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
