import React, { useEffect, useRef } from "react";
import ChatContainer from "./ChatContainer";
import NoChatSelected from "./NoChatSelected";
import Sidebar from "./Sidebar";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const ChatWorkspace = ({ compact = false, openChatUser = null }) => {
  const {
    selectedUser,
    users,
    setSelecteduser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { Socket } = useAuthStore();
  const handledOpenChatUserIdRef = useRef(null);

  useEffect(() => {
    if (!openChatUser?._id) return;
    if (handledOpenChatUserIdRef.current === openChatUser._id) return;
    if (selectedUser?._id?.toString() === openChatUser._id?.toString()) {
      handledOpenChatUserIdRef.current = openChatUser._id;
      return;
    }

    const existingUser =
      users.find((user) => user?._id?.toString() === openChatUser._id?.toString()) || openChatUser;

    setSelecteduser(existingUser);
    handledOpenChatUserIdRef.current = openChatUser._id;
  }, [openChatUser, selectedUser?._id, setSelecteduser, users]);

  useEffect(() => {
    if (!Socket) return;

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [Socket, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className={`chat-shell flex h-full w-full overflow-hidden ${compact ? "rounded-[24px] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.18)]" : "rounded-[28px]"}`}>
      <Sidebar compact={compact} />
      {!selectedUser ? <NoChatSelected compact={compact} /> : <ChatContainer compact={compact} />}
    </div>
  );
};

export default ChatWorkspace;
