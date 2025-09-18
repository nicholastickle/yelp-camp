const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


// Middleware that checks if the user is logged in then reverts an error if not. If the user is logged in then we move on with the rest of the request. req.isAuthenticated() is a Passport method for checking if someone is authenticated.
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// This is used to fix a bug which resulted from Passport being updated. The session now gets cleared after a successful login. This causes a problem with our returnTo redirect logic because we store the returnTo route path (i.e., the path where the user should be redirected back after login) in the session (req.session.returnTo), which gets cleared after a successful login.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    console.log(res.locals.returnTo);
    next();
}

// Middleware that is checking if the campground author is equal to the current logged in user. If not, it throws an error and sends you back to the campground ID. We will add this to prevent non-authors for accessing the edit and delete routes.
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Middleware used to check if the user that is currently logged in is the author of the reviews that are being showed.
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}



// Data Validation middleware for checking server side data. Only need to do this when writing to the database... i.e. post, patch, put requests.
module.exports.validateCampground = (req, res, next) => {
  
    const { error } = campgroundSchema.validate(req.body); // syntax required from JOI
    
    if (error) {
        // The error message doesn't appear in a why thats easily rendered so we need to use the array callback method below to fix that.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400) // This then assigns the error message and the error status code and then gets 
    } else {
        next(); // We must not forget next!
    }
}

// Data validation middleware for the Review data
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
