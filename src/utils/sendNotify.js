import User from '../model/authModel.js';
import Notify from '../model/notifyModel.js';

export const sendNotify = async ({ senderId, receiverId, message , path }, io) => {
    try {
        const notify = await Notify.create({
            senderId,
            receiverId,
            message,
            readBy: [],
            path
        });
        let getUser = await User.findById(senderId)
        if (notify) {
            io.emit('receiveNotification', {
                _id: notify._id,
                senderId: { _id: getUser._id, role: getUser.role },
                receiverId: notify.receiverId,
                message: notify.message,
                readBy: false,
                created_at: notify.created_at,
                path

            });
        }
        return notify;
    } catch (err) {
        console.error("Error sending notification:", err);
        throw err;
    }
};
export let getNotify = async (req, res) => {
    const { receiverId } = req.params;

    try {
        let getnotify = await Notify.find({ receiverId })
            .populate('senderId', 'profileUrl role')
            .sort({ created_at: -1 })
        const modifiedNotify = getnotify.map(notify => {
            const isRead = notify.readBy.includes(receiverId);
            return {
                ...notify.toObject(),
                readBy: isRead
            };
        });

        res.status(200).json(modifiedNotify);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export let markAllAsRead = async (req, res) => {
    const { receiverId } = req.params;

    try {
        const result = await Notify.updateMany(
            {
                receiverId,
                readBy: { $ne: receiverId } // only update if receiverId not already present
            },
            {
                $push: { readBy: receiverId }
            }
        );

        res.status(200).json({ message: 'All notifications marked as read', updatedCount: result.modifiedCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to mark notifications as read' });
    }
};


