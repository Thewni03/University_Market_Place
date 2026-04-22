import React from "react";

import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";

const getUserAvatar = (user) => user?.profilePic || user?.profile_picture || "/avatar.png";
const normalizeId = (value) => (value ? value.toString() : "");

const ChatHeader = ({ compact = false }) => {
  const { selectedUser, setSelecteduser } = useChatStore();
  const { onlineusers = [] } = useAuthStore();

  if (!selectedUser) {
    return null;
  }

  const displayName = selectedUser.fullName || selectedUser.fullname || "User";
  const isOnline = onlineusers.some((userId) => normalizeId(userId) === normalizeId(selectedUser._id));

  return (
    <div className={`border-b border-slate-200 bg-white/70 px-4 py-4 ${compact ? "" : "sm:px-6"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className={`relative rounded-2xl ring-1 ring-slate-200 ${compact ? "size-10" : "size-12"}`}>
              <img
                src={getUserAvatar(selectedUser)}
                alt={displayName}
                className="rounded-2xl object-cover"
              />
              <span
                className={`absolute bottom-1 right-1 size-3 rounded-full ring-2 ring-white ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`}
              />
            </div>
          </div>

          <div>
            <h3 className={`${compact ? "text-base" : "text-lg"} font-semibold text-slate-900`}>{displayName}</h3>
            <p className={`${compact ? "text-xs" : "text-sm"} text-slate-500`}>
              {isOnline ? "Online now" : "Currently offline"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelecteduser(null)}
          className={`inline-flex items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 ${compact ? "size-9" : "size-10"}`}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
