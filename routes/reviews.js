const express = require('express');
const catchAsync = require('../utils/catchAsync')



const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')
const router = express.Router();
const reviews = require('../controllers/reviews')



router.post('/:id/reviews', isLoggedIn, validateReview, catchAsync(reviews.create))

router.delete('/:campId/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.delete))

module.exports = router;