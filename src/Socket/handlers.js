import MessageModel from '../model/chatModel.js';

export const handleSocketEvents = (socket, io, activeUsers) => {
  socket.on("register", (userId) => {
    activeUsers.set(userId, socket.id);
  });

  socket.on("sendMessage", async ({ sender, receiver, content }) => {
    try {
      const message = await MessageModel.create({ sender, receiver, content });
      const senderSocket = activeUsers.get(sender);
      const receiverSocket = activeUsers.get(receiver);

      if (senderSocket) io.to(senderSocket).emit("receiveMessage", message);
      if (receiverSocket) io.to(receiverSocket).emit("receiveMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on('markAsRead', async ({ sender, receiver }) => {
    try {
      await MessageModel.updateMany({ sender, receiver, read: false }, { $set: { read: true } });
      const senderSocket = activeUsers.get(sender);
      if (senderSocket) {
        io.to(senderSocket).emit('messageRead', { receiverId: receiver });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  });

  socket.on("unsendLastMessage", async ({ _id, sender, receiver }) => {
    try {
      const message = await MessageModel.findById(_id);
      if (!message) return;

      message.content = "This message was deleted";
      const updatedMessage = await message.save();

      const payload = { _id: updatedMessage._id, content: updatedMessage.content };
      const senderSocket = activeUsers.get(sender);
      const receiverSocket = activeUsers.get(receiver);

      if (senderSocket) io.to(senderSocket).emit("messageUnsent", payload);
      if (receiverSocket) io.to(receiverSocket).emit("messageUnsent", payload);
    } catch (error) {
      console.error("Error unsending message:", error);
    }
  });

  


  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
};
