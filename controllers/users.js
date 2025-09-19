const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    // The below code is used if the user entered in from a different page and was redirected to the login page. req.sessions.returnTo was defined in the isLoggedIn middleware. If we don't have anything saved under the session then we just direct to the /campgrounds
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    // We need to delete the returnTo part as it is no longer needed.
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', "Goodbye!");
        res.redirect('/');
    })

}