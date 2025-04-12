import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: Schema.Types.String,
        unique: true
    },
    lastName: {
        type: Schema.Types.String,
        unique: true,
        deafult: ''
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
        default : 'user',
        enum: ['user', 'admin']
    },
    gender: {
        type: Schema.Types.String,
        default: 'not selected'
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const User = mongoose.model('Users', userSchema);

export default User;