import mongoose from 'mongoose';

let classSchema = new mongoose.Schema({
    className: {
        type: mongoose.Schema.Types.String,
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
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Packages',
        default: ''
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

let Class = mongoose.model('allClasses', classSchema);

export default Class;