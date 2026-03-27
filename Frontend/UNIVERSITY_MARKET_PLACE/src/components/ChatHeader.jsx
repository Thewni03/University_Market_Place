import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";

const getUserAvatar = (user) => user?.profilePic || user?.profile_picture || "/avatar.png";

const ChatHeader = () => {
  const { selectedUser, setSelecteduser } = useChatStore();
  const { onlineusers = [] } = useAuthStore();

  if (!selectedUser) {
    return null;
  }

  const displayName = selectedUser.fullName || selectedUser.fullname || "User";
  const isOnline = onlineusers.includes(selectedUser._id);

  return (
    <div className="border-b border-slate-200 bg-white/70 px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="relative size-12 rounded-2xl ring-1 ring-slate-200">
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
            <h3 className="text-lg font-semibold text-slate-900">{displayName}</h3>
            <p className="text-sm text-slate-500">
              {isOnline ? "Online now" : "Currently offline"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelecteduser(null)}
          className="inline-flex size-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
