import React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import ChatContainer from "../../components/ChatContainer";
import NoChatSelected from "../../components/NoChatSelected";
import Sidebar from "../../components/Sidebar";
import { useChatStore } from "../../store/useChatStore";

const Chat = () => {
  const location = useLocation();
  const { selectedUser, users, setSelecteduser } = useChatStore();
  const handledOpenChatUserIdRef = useRef(null);
  const openChatUser = useMemo(() => location.state?.openChatUser || null, [location.state]);

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

  return (
    <div className="chat-ambient min-h-[calc(100vh-4rem)] px-3 py-3 sm:px-4 sm:py-4">
      <div className="chat-ambient-inner mx-auto flex h-[calc(100vh-5.5rem)] w-full max-w-7xl items-center justify-center sm:h-[calc(100vh-6rem)]">
        <div className="chat-shell flex h-full w-full overflow-hidden rounded-[28px]">
          <Sidebar />
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
