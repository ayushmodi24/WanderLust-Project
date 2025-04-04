const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const multer = require('multer');
const { storage } = require("../cloudConfig.js");  // Ensure this path is correct
const upload = multer({ storage });


module.exports.index = async (req, res) => {
    const listVariables = await Listing.find({});
    res.render("listings/index", { listVariables }); // Fix here
};

module.exports.newForm = async (req, res) => {
    // console.log(req.user);
    res.render("listings/new")
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "No listing are Present");
        return res.redirect("/listings")
    }
    console.log(listing);
    res.render("listings/show", { listing });
}

module.exports.createListing = async (req, res, next) => {
    try {
        // Fetch coordinates from Mapbox
        let response = await geocodingClient.forwardGeocode({
            query: req.body.location,
            limit: 1,
        }).send();

        // If no location is found, show error
        if (!response.body.features.length) {
            req.flash("error", "Location not found");
            return res.redirect("/listings/new");
        }

        // Extract geometry (coordinates) from the response
        const geometry = response.body.features[0].geometry;

        // Process the uploaded image (Multer)
        // let url = req.file.path;
        let url = req.file ? req.file.path : "";
        let filename = req.file.filename;

        // Destructure other fields from the request body
        let { title, description, price, location, country } = req.body;

        // Create a new listing with the provided data
        const newlisting = new Listing({
            title: title,
            description: description,
            image: { url, filename },
            price: price,
            location: location,
            country: country,
            geometry: geometry, // Set geometry with coordinates
            owner: req.user._id // Ensure the listing has an owner (user ID)
        });

        // Save the new listing to the database
        let saveListing = await newlisting.save();

        // Log the saved listing for debugging
        console.log(saveListing);

        // Provide feedback and redirect
        req.flash("success", "New listing created successfully");
        res.redirect("/listings");
    } catch (error) {
        // Catch any errors and log them
        console.error("Error creating listing:", error);
        req.flash("error", "Failed to create listing");
        res.redirect("/listings/new");
    }
};


module.exports.editListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "No listing are Present");
        return res.redirect("/listings")
    }
    let oriImage = listing.image.url;
    oriImage = oriImage.replace("/upload", "/upload/h_300,w_250")
    res.render("listings/edit.ejs", { listing, oriImage });

}

// module.exports.updateListing = async (req, res, next) => {
//     try {
//         let { id } = req.params;
//         const { title, description, image, price, location, country } = req.body;
//         const updatedListing = await Listing.findByIdAndUpdate(id, {
//             title,
//             description,
//             image: { url: image },
//             price,
//             location,
//             country,
//         }, { new: true });

//         if (typeof req.file !== "undefined") {
//             let url = req.file.path;
//             let filename = req.file.filename;
//             updatedListing.image = { url, filename };
//             updatedListing.save();
//         }

//         if (req.file) {
//             updatedListing.image = { url: req.file.path, filename: req.file.filename };
//         }

//         await updatedListing.save();

//         req.flash("success", "Listing Updated");
//         return res.redirect(`/listings/${id}`);
//     } catch (error) {
//         // Pass the error to error-handling middleware
//         next(error);
//     }
// }

module.exports.updateListing = async (req, res, next) => {
    try {
        let { id } = req.params;
        const { title, description, price, location, country } = req.body;

        // Find the listing to update
        const updatedListing = await Listing.findById(id);

        // If the location was updated, fetch new coordinates
        if (updatedListing.location !== location) {
            // Fetch new coordinates for the updated location
            let response = await geocodingClient.forwardGeocode({
                query: location,
                limit: 1,
            }).send();

            // If no location is found, show error
            if (!response.body.features.length) {
                req.flash("error", "Location not found");
                return res.redirect(`/listings/${id}/edit`);
            }

            // Extract geometry (coordinates) from the response
            const geometry = response.body.features[0].geometry;

            // Update the geometry in the listing
            updatedListing.geometry = geometry;
        }

        // Update other fields
        updatedListing.title = title;
        updatedListing.description = description;
        updatedListing.price = price;
        updatedListing.location = location;
        updatedListing.country = country;

        // If there's a new image, update it
        if (req.file) {
            updatedListing.image = { url: req.file.path, filename: req.file.filename };
        }

        // Save the updated listing
        await updatedListing.save();

        req.flash("success", "Listing Updated");
        return res.redirect(`/listings/${id}`);
    } catch (error) {
        next(error);
    }
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    req.flash("success", " listing Deleted!");
    res.redirect("/listings");
}