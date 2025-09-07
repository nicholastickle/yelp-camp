const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema // Colt does this so that we can reference the Schema later on if we need to.

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    reviews: [
        {
            // Listing the Review IDs for this particular campground
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Mongoose middleware that looks to delete the reviews that are associated with the campground that we are deleting. We are stating "post" as this will be triggered after the campground is deleted. "doc" just refers to the campground that is being deleted.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            // The below creates a list of review IDs which will form part of the deleteMany
            _id: {
                $in: doc.reviews
            }
        })
    }
})

// Creating a new collection or model
module.exports = mongoose.model('Campground', CampgroundSchema);