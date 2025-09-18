const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// The purpose of configuring is to set up our cloudinary account with the credentials that we have in our .env file. This will allow us to upload images to our cloudinary account. This is part of the syntax we need to follow to set up cloudinary.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// This is the storage engine that we will be using to upload images to cloudinary. We are using multer-storage-cloudinary to do this. We need to specify the cloudinary instance and the parameters for the storage engine.
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        // This will be the folder on Cloudinary where the images will be stored. You can name it anything you want. We need to specify the allowed formats as well.
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = { cloudinary, storage }