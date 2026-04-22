import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import ChatWorkspace from "../../components/ChatWorkspace";

const Chat = () => {
  const location = useLocation();
  const openChatUser = useMemo(() => location.state?.openChatUser || null, [location.state]);

  return (
    <div className="chat-ambient min-h-[calc(100vh-4rem)] px-3 py-3 sm:px-4 sm:py-4">
      <div className="chat-ambient-inner mx-auto flex h-[calc(100vh-5.5rem)] w-full max-w-7xl items-center justify-center sm:h-[calc(100vh-6rem)]">
        <ChatWorkspace openChatUser={openChatUser} />
      </div>
    </div>
  );
};

export default Chat;
