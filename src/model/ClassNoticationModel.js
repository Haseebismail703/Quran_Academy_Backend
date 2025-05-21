// models/Notification.js
import mongoose from "mongoose";

const classNotification = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true }, // 👈 NEW FIELD
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
});

const ClassNotication = mongoose.model("ClassNotication", classNotification);
export default ClassNotication;
