import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore.js';

const normalizeId = (value) => (value ? value.toString() : "");

const getCurrentUserId = () => {
    const authUserId = useAuthStore.getState().authUser?._id;
    if (authUserId) return authUserId;

    try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        return storedUser?._id || null;
    } catch {
        return null;
    }
};

const moveUserToTop = (users, userId, updater = (user) => user) => {
    const normalizedUserId = normalizeId(userId);
    const nextUsers = [...users];
    const index = nextUsers.findIndex((user) => normalizeId(user._id) === normalizedUserId);

    if (index === -1) return nextUsers;

    const [user] = nextUsers.splice(index, 1);
    nextUsers.unshift(updater(user));
    return nextUsers;
};

const syncConversationMeta = (users, message, currentUserId, selectedUserId) => {
    const senderId = normalizeId(message.senderId);
    const receiverId = normalizeId(message.receiverId);
    const activeUserId =
        senderId === normalizeId(currentUserId) ? receiverId : senderId;

    return moveUserToTop(users, activeUserId, (user) => {
        const isOpenConversation = normalizeId(selectedUserId) === activeUserId;
        return {
            ...user,
            lastMessage: message.text || (message.image ? "Photo" : "New message"),
            lastMessageAt: message.createdAt || new Date().toISOString(),
            unreadCount:
                senderId === normalizeId(currentUserId) || isOpenConversation
                    ? 0
                    : (Number(user.unreadCount || 0) + 1),
        };
    });
};

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isLoadingMessages: false,
    isMessagesLoading: false,
    isLoadingUsers: false,

    getUsers: async () => {
        set({ isLoadingUsers: true });
        try {
            const userId = getCurrentUserId();
            if (!userId) {
                set({ users: [] });
                return;
            }

            const response = await axiosInstance.get('/messages/users', {
                params: { userId },
                skipAuth: true,
                withCredentials: false,
            });
            set({
                users: response.data.map((user) => ({
                    ...user,
                    unreadCount: Number(user.unreadCount || 0),
                    lastMessage: user.lastMessage || "",
                    lastMessageAt: user.lastMessageAt || "",
                })),
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching users');
        } finally {
            set({ isLoadingUsers: false });
        }
    },
    getMessages: async (userId) => {
        set({ isLoadingMessages: true, isMessagesLoading: true });
        try {
            const currentUserId = getCurrentUserId();
            const response = await axiosInstance.get(`/messages/${userId}`, {
                params: currentUserId ? { userId: currentUserId } : undefined,
                skipAuth: true,
                withCredentials: false,
            });
            const lastMessage = response.data[response.data.length - 1];
            set((state) => ({
                messages: response.data,
                users: state.users.map((user) =>
                    normalizeId(user._id) === normalizeId(userId)
                        ? {
                            ...user,
                            unreadCount: 0,
                            lastMessage: lastMessage?.text || (lastMessage?.image ? "Photo" : user.lastMessage || ""),
                            lastMessageAt: lastMessage?.createdAt || user.lastMessageAt || "",
                        }
                        : user
                ),
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Error fetching messages');
        } finally {
            set({ isLoadingMessages: false, isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();

        if (!selectedUser?._id) return;

        try {
            const currentUserId = getCurrentUserId();
            const res = await axiosInstance.post(
                `/messages/sent/${selectedUser._id}`,
                currentUserId ? { ...messageData, userId: currentUserId } : messageData,
                {
                    skipAuth: true,
                    withCredentials: false,
                }
            );
            set((state) => ({
                messages: [...messages, res.data],
                users: syncConversationMeta(
                    state.users,
                    res.data,
                    currentUserId,
                    state.selectedUser?._id
                ),
            }));
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || 'Error sending message');
            throw error;
        }
    },
    setSelecteduser: (selectedUser) => {
        set((state) => ({
            selectedUser,
            users: state.users.map((user) =>
                normalizeId(user._id) === normalizeId(selectedUser?._id)
                    ? {
                        ...user,
                        unreadCount: 0,
                    }
                    : user
            ),
        }));
    },
    subscribeToMessages: () => {
        const socket = useAuthStore.getState().Socket;
        if (!socket) return;
        const currentUserId = getCurrentUserId();
        const selectedUserId = get().selectedUser?._id;

        socket.off("new-message");
        socket.on("new-message", (newMessage) => {
            const latestSelectedUserId = get().selectedUser?._id;
            const normalizedCurrentUserId = normalizeId(currentUserId);
            const normalizedSelectedUserId = normalizeId(latestSelectedUserId);
            const normalizedSenderId = normalizeId(newMessage.senderId);
            const normalizedReceiverId = normalizeId(newMessage.receiverId);
            const belongsToOpenConversation =
                normalizedSelectedUserId &&
                (
                    (normalizedSenderId === normalizedSelectedUserId &&
                        normalizedReceiverId === normalizedCurrentUserId) ||
                    (normalizedSenderId === normalizedCurrentUserId &&
                        normalizedReceiverId === normalizedSelectedUserId)
                );

            set((state) => ({
                messages: belongsToOpenConversation
                    ? [...state.messages.filter((message) => normalizeId(message._id) !== normalizeId(newMessage._id)), newMessage]
                    : state.messages,
                users: syncConversationMeta(
                    state.users,
                    newMessage,
                    currentUserId,
                    latestSelectedUserId
                ),
            }));
        });
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().Socket;
        if (!socket) return;

        socket.off("new-message");
    }
}
));
