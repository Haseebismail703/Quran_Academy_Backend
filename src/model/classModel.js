import mongoose from 'mongoose';

let classSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses',
        required: true
    },
    classTiming: {
        type: mongoose.Schema.Types.String,
        enum: ['3 PM to 7 PM (Afternoon)',
            '7 PM to 1 AM (Evening)',
            '2 AM to 8 AM (Night)'],
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    students: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users',
                required: true
            },
            studentTiming: String,
            addedAt: {
                type: Date,
                default: Date.now
            },
            classLink: {
                type: mongoose.Schema.Types.String,
                default: ''
            },

        }
    ],

    theme: {
        type: mongoose.Schema.Types.String,
        deafult: ''
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

let Class = mongoose.model('Class', classSchema);

export default Class;