const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// We don't need to specify the username or the password as this is going to be automatically done by Passport
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true // This is new to us. This is going to check that the email is unique
    }
});

// Typical Passport syntax that makes you assign passport local to your schema
UserSchema.plugin(passportLocalMongoose);

// creating your user model and exporting it.
module.exports = mongoose.model('User', UserSchema);