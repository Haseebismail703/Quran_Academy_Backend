import TecaherNotification from "../model/techerNotificationModel.js";

// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await TecaherNotification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get notifications for a specific class
export const getNotificationsByClass = async (req, res) => {
  const { classId } = req.params;
  try {
    const notifications = await TecaherNotification.find({ classId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching class notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new notification
export const createClassNotification = async (req, res) => {
  const { title, message, expiryDate, classId } = req.body;
console.log(req.body)
  if (!title || !message || !expiryDate || !classId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newNotification = new TecaherNotification({
      title,
      message,
      expiryDate,
      classId
    });

    await newNotification.save();
    res.status(201).json({ message: "Notification created", notification: newNotification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await TecaherNotification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// get notication in studetn class page 
export let getClassNotification = async (req, res) => {
    try {
        const currentDate = new Date();
        const notifications = await TecaherNotification.find({
            expiryDate: { $gt: currentDate }
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
};