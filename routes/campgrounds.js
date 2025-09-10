const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


router.route('/')
    .get(catchAsync(campgrounds.index)) // Get request for creating the index page that simply shows all the camp ground items.
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)) // Post request to add in a new campground


router.route('/new')
    .get(isLoggedIn, campgrounds.renderNewForm) // Rendering the page that will help to create a new campground

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) // lets now add our show page which will eventually show the details of each page.
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground)) // The put request is used to update the campground entry. Notice how spread has been used here for the first time as Colt used a different method for defining the name of the "title" and "location" in the edit.ejs file.
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)) // Deleting a campground

router.route('/:id/edit')
    .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)) // Editing an existing campground. Simple get request to get to the edit page


module.exports = router;