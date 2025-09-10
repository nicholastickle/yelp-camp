const Campground = require('../models/campground');
const mongoose = require('mongoose');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground); // This is different to what we have done previously, see the new.ejs page to see why we have done rew.body.campground. We don't have to do it this way
    // Assigning the campground author to the current signed in user._id
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    // Check for valid ObjectId. This was not done by Colt. This is something I added to prevent a Cast Error
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid campground ID!');
        return res.redirect('/campgrounds');
    }
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    // Flash error that has been used to show an error if the campground doesn't exist
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
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
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}