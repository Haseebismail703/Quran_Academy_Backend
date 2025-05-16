import Notify from '../model/notifyModel.js';
const sendNotify = async ({ senderId, receiverId, message, role }, io) => {
    try {
        const notify = await Notify.create({
            senderId,
            receiverId,
            message,
            role,
            readBy: []
        });
        console.log("data", senderId, receiverId, message, role)
        io.emit('receiveNotification', notify);
        return notify;
    } catch (err) {
        console.error("Error sending notification:", err);
        throw err;
    }
};

export default sendNotify;
