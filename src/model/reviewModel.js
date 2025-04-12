import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    review: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    rating: {
        type: mongoose.Schema.Types.Number,
        required: true,
        min: 1,
        max: 5
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    packageId: {
        type: mongoose.Schema.Types.String,
        required: true
    },
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
