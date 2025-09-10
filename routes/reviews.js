const express = require('express');

// The mergeParams: true option tells Express to merge route parameters from parent routers into this child router. When your child router needs access to parent route parameters. Common in nested resource patterns like /users/:userId/posts/:postId. Useful for maintaining parameter context across router boundaries. Without mergeParams: true, child routers only see their own parameters, not the parent's.
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');


router.route('/')
    .post(isLoggedIn, validateReview, catchAsync(reviews.createReview)) // Creating a new review, validating the data using JOI, adding an ID reference to the campground.

router.route('/:reviewId')
    .delete(isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview)) // Deleting a review

module.exports = router;