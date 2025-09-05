const mongoose = require('mongoose')
const Schema = mongoose.Schema // Colt does this so that we can reference the Schema later on if we need to.

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String
});

// Creating a new collection or model
module.exports = mongoose.model('Campground', CampgroundSchema);