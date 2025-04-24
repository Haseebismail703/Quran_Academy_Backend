import mongoose from 'mongoose';

let courseSchema = new mongoose.Schema({
    courseName: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    duration: {
        type: mongoose.Schema.Types.String,
        required: true 
    },
    teacherId: {
        type: [mongoose.Schema.Types.ObjectId],
        default : [],
        ref: 'Users'
    },
    theme: {
        type: mongoose.Schema.Types.String,
        default : ""
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

let Course = mongoose.model('Courses', courseSchema);

export default Course;