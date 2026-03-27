import { useChatStore } from "../store/useChatStore";
import React, { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./Messageinput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const getUserAvatar = (user) => user?.profilePic || user?.profile_picture || "/avatar.png";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser, Socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
  }, [selectedUser?._id, getMessages]);

  useEffect(() => {
    if (!selectedUser?._id || !Socket) return;

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, Socket, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-[linear-gradient(180deg,_#fcfdfc,_#f6f8f7)]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[linear-gradient(180deg,_#fcfdfc,_#f6f8f7)]">
      <ChatHeader />

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex w-full ${message.senderId === authUser._id ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[min(85vw,32rem)] items-end gap-3 ${message.senderId === authUser._id ? "flex-row-reverse" : "flex-row"}`}>
              <div className="relative size-10 shrink-0 overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={message.senderId === authUser._id ? getUserAvatar(authUser) : getUserAvatar(selectedUser)}
                  alt="profile pic"
                  className="size-full object-cover"
                />
              </div>
              <div className={`flex flex-col ${message.senderId === authUser._id ? "items-end" : "items-start"}`}>
                <div className="mb-2">
                  <time className="ml-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div
                  className={`flex w-fit max-w-full flex-col rounded-[24px] border px-4 py-3 text-sm leading-6 shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${
                    message.senderId === authUser._id
                      ? "border-emerald-200 bg-[linear-gradient(135deg,_rgba(16,185,129,0.14),_rgba(16,185,129,0.05))] text-slate-800 shadow-[0_10px_22px_rgba(16,185,129,0.10)]"
                      : "border-slate-200 bg-white text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.05)]"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="mb-3 rounded-2xl sm:max-w-[240px]"
                    />
                  )}
                  {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
          <div ref={messageEndRef} />
        </div>
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
