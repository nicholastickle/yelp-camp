// This file will be used to seed our database. Which will not be very often, only when we want to make changes.

const mongoose = require('mongoose');
const Campground = require('../models/campground'); // requiring the model/collection
const cities = require('./cities'); // Requiring the cities .js file to generate random cities.
const { places, descriptors } = require('./seedHelpers'); // Requiring the seed helper file which will be used to generate random names.

// Connecting to the MongoDB and checking that it works.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    // useNewUrlParser: true, // No longer need this
    // useCreateIndex: true, // No longer need this
    // useUnifiedTopology: true // No longer need this
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

// Do a small tester to make sure that we can connect to the database. We also want to use a deleteMany to make sure that we delete the test data each time we seed.

// const seedDB = async () => {
//     await Campground.deleteMany({}); // Deleting the items in the existing model/collection
//     const camp = new Campground({
//         location: "New York",
//         title: "Happy camping"
//     })
//     await camp.save();
//     console.log(camp);
// }

// seedDB();

// Next we are going to create the random data needed for seeding. To do this we will use the cities.js file to generate random cities, and the seedHelpers file to generate random location names.

// Function accepts am array as a parameter. It will then return a random item within that array
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({}); // delete the existing data
    for (let i = 0; i < 50; i++) { // For loop for generating 50 random entries
        const random1000 = Math.floor(Math.random() * 1000); // There are 1000 cities in the cities.js file.
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "68c0718ade2be5812908d93d",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`, // sample function as defined above to pick out a random entry from the array.
            images: [
                {
                    url: 'https://res.cloudinary.com/dugvm4rps/image/upload/v1758221512/YelpCamp/vkyvc7ivpxyqvag9sczl.jpg',
                    filename: 'YelpCamp/vkyvc7ivpxyqvag9sczl',
                },
                {
                    url: 'https://res.cloudinary.com/dugvm4rps/image/upload/v1758221511/YelpCamp/wlk23xbnqhjqry4pyy7j.jpg',
                    filename: 'YelpCamp/wlk23xbnqhjqry4pyy7j',
                }

            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
        })
        await camp.save();

    }
    console.log("Database has been seeded!");
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Database disconnected")
})







