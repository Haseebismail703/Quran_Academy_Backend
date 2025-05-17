import mongoose from "mongoose";

const notify = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    receiverId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }],
    message: {
        type: String,
        required: true,
    },

    readBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Notify = mongoose.model("notify", notify);
export default Notify;
