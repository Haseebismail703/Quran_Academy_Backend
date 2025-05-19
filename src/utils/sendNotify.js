import User from '../model/authModel.js';
import Notify from '../model/notifyModel.js';

export const sendNotify = async ({ senderId, receiverId, receiverType, message, path }, io) => {
    try {
        const notify = await Notify.create({
            senderId,
            receiverId,
            receiverType,
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
                receiverType: notify.receiverType,
                message: notify.message,
                readBy: false,
                created_at: notify.created_at,
                path,
                receiverType

            });
        }
        return notify;
    } catch (err) {
        console.error("Error sending notification:", err);
        throw err;
    }
};


export const getNotify = async (req, res) => {
    const { receiverId } = req.params;

    try {
        // ✅ Get user role first
        const user = await User.findById(receiverId).select('role');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userRole = user.role === 'teacher' ? "teachers" : user.role === "student" ? "students" : "";

        // ✅ Build dynamic filter
        const filter = {
            $or: [
                { receiverId: receiverId }, // Direct personal messages
                { receiverType: { $in: [userRole] } } // Role-based messages
            ]
        };

        // ✅ If student or teacher, also include common messages
        if (userRole === 'student' || userRole === 'teacher') {
            filter.$or.push({ receiverType: { $all: ['students', 'teachers'] } });
        }

        // ✅ Fetch notifications
        const getnotify = await Notify.find(filter)
            .populate('senderId', 'profileUrl role gender')
            .sort({ created_at: -1 });

        // ✅ Format response with readBy check
        const modifiedNotify = getnotify.map(notify => {
            const isRead = notify.readBy.some(id => id.equals(receiverId));
            return {
                ...notify.toObject(),
                readBy: isRead
            };
        });

        res.status(200).json(modifiedNotify);
    } catch (error) {
        console.error('Error in getNotify:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export let markAllAsRead = async (req, res) => {
    const { receiverId } = req.params;

    try {
        const user = await User.findById(receiverId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userRole = user.role === 'teacher' ? "teachers" : "students"
        const result = await Notify.updateMany(
            {
                $or: [
                    { receiverId },
                    { receiverType: userRole }
                ],
                readBy: { $ne: receiverId } // Only if not already marked as read
            },
            {
                $push: { readBy: receiverId }
            }
        );

        res.status(200).json({
            message: 'All notifications marked as read',
            updatedCount: result.modifiedCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to mark notifications as read' });
    }
};



