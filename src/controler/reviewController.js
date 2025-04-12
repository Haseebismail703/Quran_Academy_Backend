import Review from "../model/reviewModel.js";


// create review
let creatReview = async (req, res) => {
    try {
        const { review, rating, userId, packageId } = req.body;

        const newReview = new Review({
            review, rating, userId, packageId
        });

        await newReview.save();
        res.status(200).json({ message: "Review added successfully", review: newReview });
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
}
// get review using package id 
let getReview = async (req, res) => {
    try {
        const { packageId } = req.params;
        const review = await Review.find({packageId});
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        // check if review is empty
        if (review.length === 0) {
            return res.status(404).json({ message: "No reviews found for this package" });
        }
        res.status(200).json(review);
    } catch (err) {
        console.error("Error fetching review:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
}

export { creatReview ,getReview }