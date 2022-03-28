const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.create = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    const newReview = new Review(req.body.review)
    newReview.author = req.user._id
    campground.reviews.push(newReview)
    await newReview.save();
    await campground.save();
    req.flash('success', 'Comment added!!!!!!!!!!!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.delete = async (req, res, next) => {
    const { campId, reviewId } = req.params;
    await Campground.findByIdAndUpdate(campId, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('warning', 'Comment deleted!!!!!!!!!!!')
    res.redirect(`/campgrounds/${campId}`)
}