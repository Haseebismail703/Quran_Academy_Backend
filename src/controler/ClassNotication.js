import ClassNotication from "../model/ClassNoticationModel.js";
import Class from '../model/classModel.js'
import { sendNotify } from "../utils/sendNotify.js";
import { io } from "../Socket/SocketConfiq.js";
import Course from "../model/courseModel.js";
import User from "../model/authModel.js";
// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await ClassNotication.find().sort({ createdAt: -1 })
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
    const notifications = await ClassNotication.find({ classId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching class notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new notification
export const createClassNotification = async (req, res) => {
  const { title, message, expiryDate, classId  } = req.body;

  if (!title || !message || !expiryDate || !classId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let findClass = await Class.findById(classId)
  .populate('courseId','courseName')
  let getStudentId = findClass.students.map(ids => ids.studentId);

  try {
    const newNotification = new ClassNotication({
      title,
      message,
      expiryDate,
      classId
    });

    await newNotification.save();


    if (newNotification) {
      let date = new Date()
      let onlyDate = date.toISOString().split('T')[0];
      // create noti for student 
      const notify = await sendNotify({
        senderId: findClass.teacherId,
        receiverId: getStudentId,
        message: `📢 No class ${onlyDate} course ${findClass.courseId?.courseName}`,
        path : "/student/class"
      }, io);

      // create noti for admin
      let getUser = await User.find({role : 'admin'})
      let adminIds = getUser.map(ids => ids._id)
       const notifyadmin = await sendNotify({
        senderId: findClass.teacherId,
        receiverId: adminIds,
        message: `📢 Class has been cancelled by the teacher ${onlyDate} course ${findClass.courseId?.courseName}`,
        path : "/admin/manage-class"
      }, io);
    }

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
    const deleted = await ClassNotication.findByIdAndDelete(id);

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
    const notifications = await ClassNotication.find({
      expiryDate: { $gt: currentDate }
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};