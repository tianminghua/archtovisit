const Campground = require('./models/campground')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema } = require('./joiSchemas')
const { reviewSchema } = require('./joiSchemas')

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //store the URL where the user is directed from
        req.session.returnTo = req.originalUrl;
        req.flash('warning', 'Please login!!!!!!!')
        res.redirect('/login')
    } else {
        next();
    }
}

const isAuthor = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', 'No permission to do that!')
        res.redirect(`/campgrounds/${req.params.id}`)
    } else {
        next()
    }
}

const isReviewAuthor = async (req, res, next) => {
    const { campId, reviewId } = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'No permission to do that!')
        res.redirect(`/campgrounds/${campId}`)
    } else {
        next()
    }
}

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


module.exports.isLoggedIn = isLoggedIn;

module.exports.isAuthor = isAuthor;
module.exports.validateCampground = validateCampground;
module.exports.validateReview = validateReview;
module.exports.isReviewAuthor = isReviewAuthor;