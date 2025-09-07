// The below schema is used for server side data validation. The package used is called JOI which is a Schema description language and data validator for JavaScript. This defines what each of the model items should be. We pass this into our validateCampground function so that when that is run it will check each time we try to write to the database that the below has been adhered to.

const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().integer().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})