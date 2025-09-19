const Campground = require('../models/campground');
const mongoose = require('mongoose');
const { cloudinary } = require("../cloudinary");

// Mapbox Geocoding configuration
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // Using the Mapbox Geocoding API to convert the location into a geometry object that will be stored in the database. We are using the forwardGeocode function to convert a location into a geometry. We are limiting the results to 1 as we only want the most relevant result. This is an async function so we need to await the result.
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1 // We only want the most relevant result
    }).send()


    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground); // This is different to what we have done previously, see the new.ejs page to see why we have done rew.body.campground. We don't have to do it this way

    // Assigning the geometry object to the campground
    campground.geometry = geoData.body.features[0].geometry;

    // Setting the images for the campground to be the files that have been uploaded. We are using map to loop over each file and return an object with the url and filename for each image.
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
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
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs); // Pushing in the new images into the existing array of images.

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    console.log(campground);

    await campground.save();
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}