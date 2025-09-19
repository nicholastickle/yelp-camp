const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema // Colt does this so that we can reference the Schema later on if we need to.

// Creating a new schema for the images that will be uploaded to Cloudinary. This is a subdocument as it is part of the Campground model
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// This is a virtual property that will create a thumbnail version of the image that is uploaded to Cloudinary. This uses the Cloudinary functionality to resize the image. We use a function() instead of an arrow function as we need access to the "this" keyword which will refer to the particular image. 
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// This is to make sure that the virtuals are included when we convert the mongoose document to JSON. This is needed as we are using a virtual property for the popup on the map.
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            // Listing the Review IDs for this particular campground
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
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