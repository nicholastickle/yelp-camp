
// Middleware that checks if the user is logged in then reverts an error if not. If the user is logged in then we move on with the rest of the request. req.isAuthenticated() is a Passport method for checking if someone is authenticated.
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl // This is needed so that the user is redirected to where they left off when they were diverted to the login page
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
    next();
}