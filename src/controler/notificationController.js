import User from "../model/authModel.js";
import Notification from "../model/notificationModel.js";
import { io } from "../Socket/SocketConfiq.js";
import { sendNotify } from "../utils/sendNotify.js";

// Create notification
export const createNotification = async (req, res) => {
  const { title, message, forRole, expiryDate } = req.body;
  try {
    const newNotification = new Notification({
      title,
      message,
      forRole,
      expiryDate,
    });
    await newNotification.save();

    if (newNotification) {
      let getUser = await User.find({ role: "admin" })
      let adminId = getUser.map(ids => ids._id)
      let role = forRole === 'all' ? ["students", "teachers"] : [forRole]
      const notify = await sendNotify({
        senderId: adminId,
        receiverType: role,
        path: "/notification",
        message: "📢 Notification received from admin",
      }, io);
    }


    res.status(201).json({ success: true, notification: newNotification });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get notifications for user (filter expired)
export const getNotificationsForUser = async (req, res) => {
  const { userId, role } = req.params;

  try {
    const now = new Date();

    const notifications = await Notification.find({
      expiryDate: { $gt: now },
      $or: [{ forRole: "all" }, { forRole: role }],
    }).sort({ createdAt: -1 });

    const data = notifications.map((n) => {
      const { readBy, ...rest } = n._doc; // 👈 Exclude readBy from response
      return {
        ...rest,
        isRead: readBy.includes(userId),
      };
    });

    res.status(200).json({ success: true, notifications: data });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};




// Mark as read
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId },
    });

    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};


// get all noti in admin dash
export let getAllNotification = async (req, res) => {
  try {
    let getNoti = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(getNoti);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}

// delete noti in admin

export let deleteNoti = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};