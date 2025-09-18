if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const methodOverride = require('method-override');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


// Connecting to the MongoDB and checking that it works.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    // useNewUrlParser: true, // No longer need this
    // useCreateIndex: true, // No longer need this
    // useUnifiedTopology: true // No longer need this
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


const app = express();


app.engine('ejs', ejsMate); // Engine used to run EJS is set to ejs-mate
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))


// Configuring sessions
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!', // this will be dealt with later on in .env variables
    resave: false, // standard template
    saveUninitialized: true, // standard template
    // Additional cookie data
    cookie: {
        httpOnly: true, // Standard security data
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // dates are measured in milliseconds. So we won't to let the cookie expire 1 week from now
        maxAge: 1000 * 60 * 60 * 24 * 7 // max age of the cookie which will be 1 week measured in milliseconds
    }
}

// session syntax and passing in the session options
app.use(session(sessionConfig))

// Implementing flash in all routes
app.use(flash())

// Passport basic setup. "User" in this case refers to the user model
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Using res.local to pass flash messages into each route
app.use((req, res, next) => {

    // if(!['/login','/'].includes(req.originalUrl)){
    //     req.session.returnTo = req.originalUrl;
    // }
    // Only store returnTo for GET requests to actual routes we care about
    if (req.method === 'GET' && !req.originalUrl.startsWith('/.well-known') && !req.originalUrl.startsWith('/login')) {
        req.session.returnTo = req.originalUrl;
    }

    res.locals.currentUser = req.user; // This is used to switch components on and off in our views depending on whether or not the user is logged in.
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Routes
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

// Basic route to get to the home page
app.get('/', (req, res) => {
    res.render('home');
})


// Error handler that will deal with all errors where we have an undefined URL. This makes use of the Express default error which has been extended with some new class items. This then gets passed on to the app.use middle shown below which then says what to do with those errors

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// Errors will be passed into the below which then makes use of the new error class that we have created.
app.use((err, req, res, next) => {
    // The default status code and default message as been set below in case we don't have it for the particular error. However, if we want to pass the error into the template, we need to make sure to assign the error to the object so that we pass it into the template and use it. Therefore the below code doesn't work:
    // const { statusCode = 500, message = "Oh no, something went wrong!" } = err;

    // Therefore we need to state the following:
    const { statusCode = 500 } = err; // Status code is not used on our templating page for now
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })

})


// Starting up the server
app.listen(3000, () => {
    console.log('serving on port 3000');
})




