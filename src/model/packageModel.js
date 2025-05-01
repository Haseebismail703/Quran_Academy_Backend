import mongoose from "mongoose";

let packageSchema = new mongoose.Schema({
    packageName: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    coursePrice: {
        type: mongoose.Schema.Types.Number,
        required: true
    },
    classPerWeek: {
        type: mongoose.Schema.Types.Number,
        default: 1
    },
    classType: {
        type: mongoose.Schema.Types.String,
        required: true,
        default: 'One to One'
    },
    sessionDuration: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: 30
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    courseId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses'
    },
    paymentStatus: {
        type: mongoose.Schema.Types.String,
        default: 'inCompleted',
        enum: ['completed', 'inCompleted']
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

let Package = mongoose.model('Packages', packageSchema);
export default Package;