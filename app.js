const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground.js'); // requiring the model/collection
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { campgroundSchema } = require('./schemas.js');

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

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Data Validation function for checking server side data. Only need to do this when writing to the database... i.e. post, patch, put requests.
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); // syntax required from JOI
    if (error) {
        // The error message doesn't appear in a why thats easily rendered so we need to use the array callback method below to fix that.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400) // This then assigns the error message and the error status code and then gets 
    } else {
        next(); // We must not forget next!
    }
}

// Basic route to get to the home page
app.get('/', (req, res) => {
    res.render('home');
})

// Testing the adding of a single line of 
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', description: 'cheap camping!' });
//     await camp.save();
//     res.send(camp)
// })

// Get request for creating the index page that simply shows all the camp ground items.
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// Rendering the page that will help to create a new campground

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// Post request to add in a new campground

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground); // This is different to what we have done previously, see the new.ejs page to see why we have done rew.body.campground. We don't have to do it this way
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// lets now add our show page which will eventually show the details of each page.

app.get('/campgrounds/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}))

// Editing an existing campground. Simple get request to get to the edit page

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

// The below put request is used to update the campground entry. Notice how spread has been used here for the first time as Colt used a different method for defining the name of the "title" and "location" in the edit.ejs file.
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Deleting a campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

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


