import mongoose from "mongoose";

let CareerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    number: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Career", CareerSchema);