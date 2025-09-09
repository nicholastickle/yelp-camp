const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');


// Route that takes us to the page where we can register a new user
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Post request that will create a new user or throw an error the username or email exists or any other error that Passport may pick up. We haven't seen a try and catch like this for routing, but can be done anywhere where we need it. Something we haven't done here is redirect the user to the login page if the username already exists. We could do this later on
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        // The below syntax is comes from Passport. We need to assign the email and username to "user". We then need to use User.register which is a again Passport syntax.
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        // req.login() expects an err functions to be included so thats what we will include
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// Get request which takes us to the Login page
router.get('/login', (req, res) => {
    res.render('users/login');
})

// Post request that is used for the login page. Again more Passport syntax. "local" below refers to the passport-local option we picked instead of using say Google or Facebook signIn.
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    // The below code is used if the user entered in from a different page and was redirected to the login page. req.sessions.returnTo was defined in the isLoggedIn middleware. If we don't have anything saved under the session then we just direct to the /campgrounds
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    // We need to delete the returnTo part as it is no longer needed.
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

// This is the route for logging out. req.logout() is another Passport method. It simply deletes the session ID for the user. We then get redirected. Note that req.logout() requires a callback err function to be included. And we need to include our flash and redirect into the req.logout
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);

        }
        req.flash('success', "Goodbye!");
        res.redirect('/campgrounds');
    })

})

module.exports = router;