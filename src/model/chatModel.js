import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
