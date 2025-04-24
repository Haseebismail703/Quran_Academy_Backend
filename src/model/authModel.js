import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: Schema.Types.String,
        unique: true
    },
    lastName: {
        type: Schema.Types.String
        // default: ''
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    role: {
        type: Schema.Types.String,
        required: true,
        default: 'student',
        enum: ['student', 'admin', 'teacher']
    },
    gender: {
        type: Schema.Types.String,
        default: 'not selected'
    },
    
    classes: [
        {
            teacherId: {
                type: Schema.Types.ObjectId,
                ref: 'Users', // Assuming teachers are also stored in the Users collection
                default : null
            },
            classId: {
                type: Schema.Types.ObjectId,
                ref: 'classes', 
                default : null
            },
            courseId: {
                type: Schema.Types.ObjectId,
                ref: 'courses', 
                default : null
            },
            status: {
                type: Schema.Types.String,
                default: 'waiting',
                enum: ['waiting', 'join']
            },
            timing : {
                type: Schema.Types.String,
                default: 'not selected'
            },
            classLink : {
                type: Schema.Types.String,
                default: ''
            }
        }
    ]
    ,
    profileUrl : {
        type: Schema.Types.String,
        default: ''
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const User = mongoose.model('Users', userSchema);

export default User;