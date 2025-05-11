// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  forRole: {
    type: String,
    enum: ["all", "students", "teachers"],
    default: "all",
  },
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true }, // 👈 NEW FIELD
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
