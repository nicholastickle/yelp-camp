const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError.js');
const Campground = require('../models/campground.js');

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


// Get request for creating the index page that simply shows all the camp ground items.
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// Rendering the page that will help to create a new campground

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

// Post request to add in a new campground

router.post('/', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground); // This is different to what we have done previously, see the new.ejs page to see why we have done rew.body.campground. We don't have to do it this way
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// lets now add our show page which will eventually show the details of each page.

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    // Check for valid ObjectId. This was not done by Colt. This is something I added to prevent a Cast Error
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid campground ID!');
        return res.redirect('/campgrounds');
    }

    const campground = await Campground.findById(req.params.id).populate('reviews');

    // Flash error that has been used to show an error if the campground doesn't exist
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }


    res.render('campgrounds/show', { campground });
}));

// Editing an existing campground. Simple get request to get to the edit page

router.get('/:id/edit', catchAsync(async (req, res) => {

    const { id } = req.params;
    // Check for valid ObjectId. This was not done by Colt. This is something I added to prevent a Cast Error
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid campground ID!');
        return res.redirect('/campgrounds');
    }

    const campground = await Campground.findById(req.params.id);
    // Flash error that has been used to show an error if the campground doesn't exist
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }


    res.render('campgrounds/edit', { campground });
}))

// The below put request is used to update the campground entry. Notice how spread has been used here for the first time as Colt used a different method for defining the name of the "title" and "location" in the edit.ejs file.
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Deleting a campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}))

module.exports = router;