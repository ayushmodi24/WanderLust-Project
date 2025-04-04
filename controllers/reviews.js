const Listing = require("../models/listing.js");
const Review = require("../models/review.js")


module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);  // Find the listing by ID
    console.log(req.body);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    let newReview = new Review(req.body.review); // Create a new review from the form data
    newReview.author = req.user._id;
    console.group(newReview);

    await newReview.save();

    listing.reviews.push(newReview);

    await listing.save();
    req.flash("success" , "New Review Added");

    console.log("Review Saved");

    res.redirect(`/listings/${listing._id}`);
}
module.exports.deleteReview = async(req,res) =>
    {
        let{id, reviewId} = req.params;
    
        await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
        await Review.findByIdAndDelete(reviewId);
        req.flash("success" , " Review Deleted");
    
        res.redirect(`/listings/${id}`);
    }