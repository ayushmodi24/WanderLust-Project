// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// main()
//     .then(() => {
//         console.log("res");
//     })
//     .catch(err => console.log(err));

// async function main() {
//     await mongoose.connect('mongodb://127.0.0.1:27017/wander');
// };

// const initDB = async() =>
// {
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) => ({...obj , owner: "67ebeb7631158c01f958c48f"}));
//     await Listing.insertMany(initData.data);
//     console.log("Data Inserted");
//     // resizeBy.send("Successful");
// }

// initDB();

const axios = require('axios'); // We use Axios for making HTTP requests

// Your OpenCage API key (replace with your actual key)
const OPEN_CAGE_API_KEY = process.env.CLOUD_API_KEY;

// Function to get coordinates from OpenCage API
async function getCoordinatesFromAPI(location) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${OPEN_CAGE_API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        
        if (data.results && data.results.length > 0) {
            // Get the first result's geometry (lat/lng)
            const coordinates = data.results[0].geometry;
            return { type: "Point", coordinates: [coordinates.lng, coordinates.lat] };
        } else {
            // Return a default if no result is found
            return { type: "Point", coordinates: [0, 0] };
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return { type: "Point", coordinates: [0, 0] }; // Return default if there's an error
    }
}

// Helper function to get geometry data for a location
async function getGeometryForLocation(location) {
    // Get coordinates from the OpenCage API (this is asynchronous)
    const geometry = await getCoordinatesFromAPI(location);
    return geometry;
}

// Main function to insert all listings
async function main() {
    const mongoose = require("mongoose");
    const initData = require("./data.js"); // Assuming your listings data is here
    const Listing = require("../models/listing.js"); // Your model

    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/wander');
        console.log("Connected to MongoDB");

        // Delete any existing listings to avoid duplicates
        await Listing.deleteMany({});

        // Loop through each listing and add the geometry (coordinates) dynamically
        for (let i = 0; i < initData.data.length; i++) {
            const listing = initData.data[i];

            // Get geometry for each location asynchronously
            const geometry = await getGeometryForLocation(listing.location);

            // Add geometry to the listing
            listing.geometry = geometry;
            listing.owner = "67ebeb7631158c01f958c48f"; // Replace with actual ObjectId for owner

            // Insert the listing into MongoDB (one by one or use insertMany later if needed)
            await Listing.create(listing);
        }

        console.log("Data Inserted Successfully");
    } catch (err) {
        console.log("Error occurred:", err);
    }
}

// Execute the main function
main();
