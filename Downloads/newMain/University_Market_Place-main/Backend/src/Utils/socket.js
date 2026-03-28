const userSocketMap = new Map();

export const getReceiverSocketId = (userId) =>
  userId ? Array.from(userSocketMap.get(userId.toString()) || [])[0] : undefined;

const getOnlineUsers = () => Array.from(userSocketMap.keys());

const addUserSocket = (userId, socketId) => {
  if (!userId || !socketId) return;
  const currentSockets = userSocketMap.get(userId) || new Set();
  currentSockets.add(socketId);
  userSocketMap.set(userId, currentSockets);
};

const removeUserSocket = (userId, socketId) => {
  if (!userId || !socketId) return;

  const currentSockets = userSocketMap.get(userId);
  if (!currentSockets) return;

  currentSockets.delete(socketId);

  if (currentSockets.size === 0) {
    userSocketMap.delete(userId);
    return;
  }

  userSocketMap.set(userId, currentSockets);
};

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId?.toString();

    if (userId) {
      addUserSocket(userId, socket.id);
      socket.join(userId);
    }

    io.emit("online-users", getOnlineUsers());

    socket.on("join", (joinedUserId) => {
      const normalizedUserId = joinedUserId?.toString();
      if (!normalizedUserId) return;

      addUserSocket(normalizedUserId, socket.id);
      socket.join(normalizedUserId);
      io.emit("online-users", getOnlineUsers());
    });

    socket.on("disconnect", () => {
      if (userId) removeUserSocket(userId, socket.id);

      io.emit("online-users", getOnlineUsers());
    });
  });
};
