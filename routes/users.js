const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister) // Route that takes us to the page where we can register a new user
    .post(catchAsync(users.register)) // Post request that will create a new user or throw an error the username or email exists or any other error that Passport may pick up. We haven't seen a try and catch like this for routing, but can be done anywhere where we need it. Something we haven't done here is redirect the user to the login page if the username already exists. We could do this later on

router.route('/login')
    .get(users.renderLogin) // Get request which takes us to the Login page
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login) // Post request that is used for the login page. Again more Passport syntax. "local" below refers to the passport-local option we picked instead of using say Google or Facebook signIn.

router.route('/logout')
    .get(users.logout) // This is the route for logging out. req.logout() is another Passport method. It simply deletes the session ID for the user. We then get redirected. Note that req.logout() requires a callback err function to be included. And we need to include our flash and redirect into the req.logout

module.exports = router;