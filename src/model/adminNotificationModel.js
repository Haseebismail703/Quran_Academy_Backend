import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users", 
    default: null, 
  },
  role: {
    type: String,
    enum: ["student", "teacher", "all"],
    default: "all",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Notification = mongoose.model("AdminNoti", adminNotificationSchema);
export default Notification;
