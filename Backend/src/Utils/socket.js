const userSocketMap = {};

export const getReceiverSocketId = (userId) =>
  userId ? userSocketMap[userId.toString()] : undefined;

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId?.toString();

    if (userId) {
      userSocketMap[userId] = socket.id;
      socket.join(userId);
    }

    io.emit("online-users", Object.keys(userSocketMap));

    socket.on("join", (joinedUserId) => {
      const normalizedUserId = joinedUserId?.toString();
      if (!normalizedUserId) return;

      userSocketMap[normalizedUserId] = socket.id;
      socket.join(normalizedUserId);
      io.emit("online-users", Object.keys(userSocketMap));
    });

    socket.on("disconnect", () => {
      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }

      io.emit("online-users", Object.keys(userSocketMap));
    });
  });
};

