import mongoose from 'mongoose';

let courseSchema = new mongoose.Schema({
    courseName: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    shift: {
        type: mongoose.Schema.Types.String,
        enum: ['3 to 7 afternoon', '7 to 1 evening', '2 to 8 night'],
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    studentId: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: 'Users'
    },
    classLink: {
        type: mongoose.Schema.Types.String,
        default: ''
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

let Course = mongoose.model('Courses', courseSchema);

export default Course;